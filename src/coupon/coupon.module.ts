import { Module } from "@nestjs/common";
import { CouponService } from "./coupon.service";
import { CouponController } from "./coupon.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CouponEntity } from "src/entities/coupon.entity";
import { CartEntity } from "src/entities/cart.entity";
import { CartItemEntity } from "src/entities/cart-item.entity";
import { CouponUsageEntity } from "src/entities/coupon-usage.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CouponEntity,
      CartEntity,
      CartItemEntity,
      CouponUsageEntity,
    ]),
  ],
  controllers: [CouponController],
  providers: [CouponService],
  exports: [CouponService],
})
export class CouponModule {}
