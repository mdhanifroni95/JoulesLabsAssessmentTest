import { DiscountType } from "src/utils/enum";
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity({ name: "coupons" })
export class CouponEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  code: string;

  @Column({ type: "timestamp with time zone", nullable: true })
  startAt?: Date;

  @Column({ type: "timestamp with time zone", nullable: true })
  endAt?: Date;

  @Column({ type: "enum", enum: DiscountType })
  discountType: DiscountType;

  // For FIXED: value = fixed amount (e.g. 100). For PERCENTAGE: value = percent number (e.g. 10).
  @Column({ type: "float", nullable: true })
  value: number;

  @Column({ type: "float", nullable: true })
  maxDiscountAmount: number;

  @Column({ type: "int", nullable: true })
  minCartItems: number;

  @Column({ type: "float", nullable: true })
  minTotalPrice: number;

  // product-specific restriction: store as JSON array of product IDs; if empty/NULL -> applies to all
  @Column({ type: "simple-array", nullable: true })
  productIds: string[];

  @Column({ default: false })
  autoApply: boolean;

  @Column({ type: "int", nullable: true })
  maxUses?: number;

  @Column({ type: "int", nullable: true })
  maxUsesPerUser?: number;

  @Column({ type: "int", default: 0 })
  totalUses: number;

  @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  updatedAt: Date;
}
