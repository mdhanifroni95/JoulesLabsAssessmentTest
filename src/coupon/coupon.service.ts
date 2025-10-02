import { BadRequestException, Injectable } from "@nestjs/common";
import { CreateCouponDto } from "./dto/create-coupon.dto";
import { UpdateCouponDto } from "./dto/update-coupon.dto";
import { DataSource, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { CouponEntity } from "src/entities/coupon.entity";
import { CouponUsageEntity } from "src/entities/coupon-usage.entity";
import { DiscountType } from "src/utils/enum";

@Injectable()
export class CouponService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(CouponEntity)
    private couponRepo: Repository<CouponEntity>,
    @InjectRepository(CouponUsageEntity)
    private usageRepo: Repository<CouponUsageEntity>,
  ) {}

  async createCoupon(dto: CreateCouponDto) {
    const now = new Date();
    const getCoupon = await this.couponRepo
      .createQueryBuilder("c")
      .where("c.code = :code", { code: dto.code })
      .andWhere("(c.endAt IS NULL OR c.endAt >= :now)", { now })
      .getOne();
    if (getCoupon) {
      throw new BadRequestException("Coupon code already exists");
    }
    const coupon = this.couponRepo.create(dto);
    return await this.couponRepo.save(coupon);
  }

  async findAll() {
    return await this.couponRepo.find();
  }

  async findOne(id: string) {
    return await this.couponRepo.findOne({ where: { id } });
  }

  async updateCoupon(id: string, dto: UpdateCouponDto) {
    const coupon = await this.couponRepo.findOne({ where: { id } });
    if (!coupon) {
      throw new BadRequestException("Coupon not found");
    } else {
      Object.assign(coupon, dto);
      return await this.couponRepo.save(coupon);
    }
  }

  //retrieve coupon by code
  findByCode(code: string) {
    return this.couponRepo.findOne({ where: { code } });
  }

  // get all auto-apply coupons (active ones)
  getAutoApplyCandidates() {
    const now = new Date();
    return this.couponRepo
      .createQueryBuilder("c")
      .where("c.autoApply = :auto", { auto: true })
      .andWhere("(c.startAt IS NULL OR c.startAt <= :now)", { now })
      .andWhere("(c.endAt IS NULL OR c.endAt >= :now)", { now })
      .getMany();
  }

  // validate a coupon against cart snapshot returns discount amount and reasons if invalid
  validateAndCalculateDiscount(
    coupon: CouponEntity,
    cart: { items: any[]; totalBeforeDiscount: number },
    userId: string,
  ) {
    const now = new Date();
    if (coupon.startAt && coupon.startAt > now) {
      throw new BadRequestException("Coupon not started yet");
    }
    if (coupon.endAt && coupon.endAt < now) {
      throw new BadRequestException("Coupon expired");
    }

    if (coupon.minCartItems && cart.items.length < coupon.minCartItems) {
      throw new BadRequestException(
        `Minimum ${coupon.minCartItems} items required in cart`,
      );
    }
    if (
      coupon.minTotalPrice &&
      cart.totalBeforeDiscount < coupon.minTotalPrice
    ) {
      throw new BadRequestException(
        `Minimum cart total of ${coupon.minTotalPrice} required`,
      );
    }
    // product-specific: ensure at least one cart item in coupon.productIds
    if (coupon.productIds && coupon.productIds.length > 0) {
      const hasProduct = cart.items.some((i) =>
        coupon.productIds.includes(i.productId),
      );
      if (!hasProduct)
        throw new BadRequestException(
          "Coupon not applicable to products in cart",
        );

      // usage limits (only informative here; actual increment must be atomic when applying)
      const totalUsesReached =
        coupon.maxUses && coupon.totalUses >= coupon.maxUses;

      if (totalUsesReached)
        throw new BadRequestException("Coupon usage limit reached");

      // per-user uses check (non-atomic read)
      // We'll check repository for existing usage
      // This method returns an object; repo lookups are async -> make this async in real code
      // But for sample, return valid and compute discount amount

      const total = cart.totalBeforeDiscount;
      let discount = 0;
      if (coupon.discountType === DiscountType.FIXED_AMOUNT) {
        discount = coupon.value;
      } else {
        discount = (coupon.value / 100) * total;
      }

      if (coupon.maxDiscountAmount != null)
        discount = Math.min(discount, coupon.maxDiscountAmount);
      discount = Math.min(discount, total); // can't exceed total

      return {
        valid: true,
        discount,
        message: "Coupon valid",
      };
    }
  }

  // Atomic apply: increments usage counters in transaction (important for concurrency)
  async applyCouponAtomically(
    code: string,
    cartSnapshot: { items: any[]; totalBeforeDiscount: number },
    userId: string,
  ) {
    return this.dataSource.transaction(async (manager) => {
      const coupon = await manager
        .getRepository(CouponEntity)
        .createQueryBuilder("c")
        .setLock("pessimistic_write") // SELECT FOR UPDATE
        .where("c.code = :code", { code })
        .getOne();

      if (!coupon) throw new BadRequestException("Invalid coupon");

      // perform same validation but with fresh coupon
      const now = new Date();
      if (coupon.startAt && coupon.startAt > now)
        throw new BadRequestException("Coupon not started");

      if (coupon.endAt && coupon.endAt < now)
        throw new BadRequestException("Coupon expired");

      // console.log("coupon", coupon);
      // console.log("cartSnapshot", cartSnapshot);
      // console.log("cartSnapshot length", cartSnapshot.items.length);

      if (
        coupon.minCartItems &&
        cartSnapshot.items.length < coupon.minCartItems
      )
        throw new BadRequestException(`Min items ${coupon.minCartItems}`);

      if (
        coupon.minTotalPrice &&
        cartSnapshot.totalBeforeDiscount < coupon.minTotalPrice
      )
        throw new BadRequestException(`Min total ${coupon.minTotalPrice}`);

      if (coupon.productIds && coupon.productIds.length > 0) {
        const hasProduct = cartSnapshot.items.some((i) =>
          coupon.productIds.includes(i.productId),
        );
        if (!hasProduct)
          throw new BadRequestException(
            "Coupon not applicable to products in cart",
          );
      }
      // console.log("coupon after checks", coupon);
      if (coupon.maxUses != null && coupon.totalUses >= coupon.maxUses)
        throw new BadRequestException("Coupon max uses reached");

      // check per-user usage
      let usage = await manager
        .getRepository(CouponUsageEntity)
        .findOne({ where: { couponId: coupon.id, userId } });
      if (!usage) {
        usage = manager
          .getRepository(CouponUsageEntity)
          .create({ couponId: coupon.id, userId, uses: 0 });
        await manager.getRepository(CouponUsageEntity).save(usage);
      }
      if (coupon.maxUsesPerUser != null && usage.uses >= coupon.maxUsesPerUser)
        throw new BadRequestException("Coupon usage per user limit reached");

      // compute discount
      const total = cartSnapshot.totalBeforeDiscount;
      let discount =
        coupon.discountType === DiscountType.FIXED_AMOUNT
          ? coupon.value
          : (coupon.value / 100) * total;
      if (coupon.maxDiscountAmount != null)
        discount = Math.min(discount, coupon.maxDiscountAmount);
      discount = Math.min(discount, total);

      // increment counts and persist
      coupon.totalUses += 1;
      await manager.getRepository(CouponEntity).save(coupon);

      usage.uses += 1;
      await manager.getRepository(CouponUsageEntity).save(usage);

      return { couponCode: coupon.code, discount };
    });
  }
}
