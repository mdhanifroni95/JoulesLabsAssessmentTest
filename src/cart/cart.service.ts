import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CartEntity } from "../entities/cart.entity";
import { CartItemEntity } from "../entities/cart-item.entity";
import { CouponService } from "src/coupon/coupon.service";
@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartEntity) private cartRepo: Repository<CartEntity>,
    @InjectRepository(CartItemEntity)
    private itemRepo: Repository<CartItemEntity>,
    private couponService: CouponService,
  ) {}

  async getOrCreateCart(userId: string) {
    let cart = await this.cartRepo.findOne({ where: { userId } });
    if (!cart) {
      cart = this.cartRepo.create({ userId, items: [] });
      await this.cartRepo.save(cart);
    }
    return cart;
  }

  async addItem(
    userId: string,
    itemDto: {
      productId: string;
      name: string;
      unitPrice: number;
      quantity: number;
    },
  ) {
    const cart = await this.getOrCreateCart(userId);
    const existing = cart.items.find((i) => i.productId === itemDto.productId);
    if (existing) {
      existing.quantity += itemDto.quantity;
    } else {
      const newItem = this.itemRepo.create({ ...itemDto, cart });
      cart.items.push(newItem);
    }
    await this.cartRepo.save(cart);
    return this.recalculateCart(cart, userId);
  }

  async updateItem(
    userId: string,
    itemId: string,
    update: { quantity?: number; unitPrice?: number },
  ) {
    const cart = await this.getOrCreateCart(userId);
    const item = cart.items.find((i) => i.id === itemId);
    if (!item) throw new NotFoundException("Item not found");
    if (update.quantity != null) item.quantity = update.quantity;
    if (update.unitPrice != null) item.unitPrice = update.unitPrice;
    await this.cartRepo.save(cart);
    return this.recalculateCart(cart, userId);
  }

  async removeItem(userId: string, itemId: string) {
    const cart = await this.getOrCreateCart(userId);
    cart.items = cart.items.filter((i) => i.id !== itemId);
    await this.cartRepo.save(cart);
    return this.recalculateCart(cart, userId);
  }

  // core: compute totals, apply coupon (manual or auto)
  async recalculateCart(
    cart: CartEntity,
    userId: string,
    manualCouponCode?: string,
  ) {
    // compute total before discount
    const total = cart.items.reduce(
      (s, it) => s + it.unitPrice * it.quantity,
      0,
    );
    cart.totalBeforeDiscount = total;
    cart.discountAmount = 0;
    cart.appliedCouponCode = undefined;

    if (manualCouponCode) {
      // try to apply manual coupon (atomic)
      const result = await this.couponService.applyCouponAtomically(
        manualCouponCode,
        { items: cart.items, totalBeforeDiscount: total },
        userId,
      );
      cart.discountAmount = result.discount;
      cart.appliedCouponCode = result.couponCode;
    } else {
      // auto-apply best eligible coupon
      const candidates = await this.couponService.getAutoApplyCandidates();
      let best: { discount: number; code: string | null } = {
        discount: 0,
        code: null,
      };
      for (const c of candidates) {
        const validation = this.couponService.validateAndCalculateDiscount(
          c,
          { items: cart.items, totalBeforeDiscount: total },
          userId,
        );
        if (validation?.valid && validation.discount > best.discount) {
          best = { discount: validation.discount, code: c.code };
        }
      }
      if (best.code) {
        // attempt to atomically apply chosen coupon (might fail if someone else consumed last use)
        try {
          const res = await this.couponService.applyCouponAtomically(
            best.code,
            { items: cart.items, totalBeforeDiscount: total },
            userId,
          );
          cart.discountAmount = res.discount;
          cart.appliedCouponCode = res.couponCode;
        } catch (e) {
          // if race caused apply to fail, we skip coupon (or you can retry to next best)
          cart.discountAmount = 0;
          cart.appliedCouponCode = undefined;
        }
      }
    }

    cart.finalAmount = Math.max(
      0,
      Number((cart.totalBeforeDiscount - cart.discountAmount).toFixed(2)),
    );
    await this.cartRepo.save(cart);
    return cart;
  }
}
