import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { CartItemEntity } from "./cart-item.entity";

@Entity({ name: "carts" })
export class CartEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  userId: string;

  @OneToMany(() => CartItemEntity, (item) => item.cart, {
    cascade: true,
    eager: true,
  })
  items: CartItemEntity[];

  @Column({ type: "float", default: 0 })
  totalBeforeDiscount: number;

  @Column({ type: "float", default: 0 })
  discountAmount: number;

  @Column({ type: "float", default: 0 })
  finalAmount: number;

  @Column({ nullable: true })
  appliedCouponCode?: string;
}
