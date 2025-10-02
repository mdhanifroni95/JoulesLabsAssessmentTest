import { DiscountType } from "src/utils/enum";
import { CouponService } from "./coupon.service";

describe("Coupon validation & calculation (pure)", () => {
  const svc = new CouponService(null as any, null as any, null as any);

  it("calculates percentage discount and caps with maxDiscountAmount", () => {
    const coupon = {
      code: "P10",
      discountType: DiscountType.PERCENTAGE,
      value: 10, // 10%
      maxDiscountAmount: 30,
      startAt: null,
      endAt: null,
      minCartItems: null,
      minTotalPrice: null,
      productIds: null,
      maxUses: null,
      totalUses: 0,
    } as any;

    const cart = {
      items: [{ productId: "p1", unitPrice: 100, quantity: 1 }],
      totalBeforeDiscount: 100,
    };

    const res = svc.validateAndCalculateDiscount(coupon, cart, "u1")!;
    // 10% of 100 = 10 (less than cap)
    expect(res.valid).toBe(true);
    expect(res.discount).toBe(10);
  });

  it("caps percentage by maxDiscountAmount", () => {
    const coupon = {
      code: "P50",
      discountType: DiscountType.PERCENTAGE,
      value: 50, // 50%
      maxDiscountAmount: 30,
      startAt: null,
      endAt: null,
      minCartItems: null,
      minTotalPrice: null,
      productIds: null,
      totalUses: 0,
    } as any;

    const cart = { items: [], totalBeforeDiscount: 100 };

    const res = svc.validateAndCalculateDiscount(coupon, cart, "u1")!;
    expect(res.valid).toBe(true);
    expect(res.discount).toBe(30); // capped at 30
  });
});
