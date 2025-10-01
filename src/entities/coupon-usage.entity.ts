import { Column, Entity, PrimaryGeneratedColumn, Unique } from "typeorm";

Entity({ name: "coupon_usages" });

@Unique(["couponId", "userId"])
export class CouponUsage {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  couponId: string;

  @Column()
  userId: string;

  @Column({ type: "int", default: 0 })
  uses: number;
}
