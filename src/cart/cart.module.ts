import { Module } from "@nestjs/common";
import { CartService } from "./cart.service";
import { CartController } from "./cart.controller";
import { CartEntity } from "src/entities/cart.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CouponEntity } from "src/entities/coupon.entity";
import { CartItemEntity } from "src/entities/cart-item.entity";
import { CouponService } from "src/coupon/coupon.service";
import { CouponModule } from "src/coupon/coupon.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([CartEntity, CouponEntity, CartItemEntity]),
    CouponModule,
  ],
  controllers: [CartController],
  providers: [CartService],
})
export class CartModule {}
