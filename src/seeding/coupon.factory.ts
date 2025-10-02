import { faker } from "@faker-js/faker";
import { CouponEntity } from "../entities/coupon.entity";
import { DiscountType } from "../utils/enum";

import { setSeederFactory } from "typeorm-extension";

export const CouponFactory = setSeederFactory(CouponEntity, () => {
  const coupon = new CouponEntity();
  const isPercentage = faker.datatype.boolean();
  let maxDiscountAmount =
    typeof coupon.maxDiscountAmount === "number"
      ? coupon.maxDiscountAmount
      : null;

  coupon.code = faker.string.alphanumeric(8).toUpperCase(); // e.g. "SAVE1234"
  coupon.discountType = isPercentage
    ? DiscountType.PERCENTAGE
    : DiscountType.FIXED_AMOUNT;
  coupon.value = isPercentage
    ? faker.number.int({ min: 5, max: 50 })
    : faker.number.int({ min: 50, max: 500 });
  maxDiscountAmount = isPercentage
    ? faker.number.int({ min: 100, max: 500 })
    : null;
  coupon.minCartItems = faker.number.int({ min: 1, max: 5 });
  coupon.minTotalPrice = faker.number.int({ min: 100, max: 1000 });
  coupon.autoApply = faker.datatype.boolean();
  coupon.maxUses = faker.number.int({ min: 10, max: 200 });
  coupon.maxUsesPerUser = faker.number.int({ min: 1, max: 5 });
  coupon.startAt = new Date();
  coupon.endAt = faker.date.future();
  coupon.totalUses = 0;

  return coupon;
});
