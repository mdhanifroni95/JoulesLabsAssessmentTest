import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Delete,
  Patch,
  Req,
} from "@nestjs/common";
import { CartService } from "./cart.service";
import { CreateCartDto } from "./dto/create-cart.dto";
import { UpdateCartDto } from "./dto/update-cart.dto";
import { ApplyCouponDto } from "src/coupon/dto/apply-coupon.dto";

@Controller("cart")
export class CartController {
  constructor(private cartService: CartService) {}

  // NOTE: For demo we take userId from header 'x-user-id'. In real app use AuthGuard
  private getUserId(req): string {
    return req.headers["x-user-id"] || "anonymous";
  }

  @Post("items")
  async addItem(@Body() body: CreateCartDto, @Req() req) {
    const userId = this.getUserId(req);
    return this.cartService.addItem(userId, body);
  }

  @Patch("items/:id")
  async updateItem(
    @Param("id") id: string,
    @Body() body: UpdateCartDto,
    @Req() req,
  ) {
    const userId = this.getUserId(req);
    return this.cartService.updateItem(userId, id, body);
  }

  @Delete("items/:id")
  async removeItem(@Param("id") id: string, @Req() req) {
    const userId = this.getUserId(req);
    return this.cartService.removeItem(userId, id);
  }

  @Post("apply-coupon")
  async applyCoupon(@Body() body: ApplyCouponDto, @Req() req) {
    const userId = this.getUserId(req);
    const cart = await this.cartService.getOrCreateCart(userId);
    return this.cartService.recalculateCart(cart, userId, body.code);
  }

  @Get()
  async getCart(@Req() req) {
    const userId = this.getUserId(req);
    return this.cartService.getOrCreateCart(userId);
  }
}
