import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from "@nestjs/common";
import { CreateCouponDto } from "./dto/create-coupon.dto";
import { CouponService } from "./coupon.service";

@Controller("coupon")
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  @Post("create-coupon")
  async createCoupon(@Body() CreateCouponDto: CreateCouponDto) {
    const coupon = await this.couponService.createCoupon(CreateCouponDto);
    if (!coupon) {
      return { success: false, message: "Failed to create coupon" };
    } else {
      return { success: true, data: coupon };
    }
  }

  @Get()
  async getAll() {
    const coupons = await this.couponService.findAll();
    return { success: true, data: coupons };
  }

  @Get(":id")
  async getOne(@Param("id") id: string) {
    const coupon = await this.couponService.findOne(id);
    if (!coupon) {
      return { success: false, message: "Coupon not found" };
    } else {
      return { success: true, data: coupon };
    }
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updateCouponDto: any) {
    const coupon = this.couponService.updateCoupon(id, updateCouponDto);
    if (!coupon) {
      return { success: false, message: "Failed to update coupon" };
    } else {
      return {
        success: true,
        message: "Coupon update successfully",
        data: coupon,
      };
    }
  }
}
