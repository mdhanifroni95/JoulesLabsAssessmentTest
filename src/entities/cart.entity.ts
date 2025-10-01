import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { CartItem } from "./cart-item.entity";

@Entity({ name: "carts" })
export class Cart {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  userId: string;

  @OneToMany(() => CartItem, (item) => item.cart, {
    cascade: true,
    eager: true,
  })
  items: CartItem[];

  @Column({ type: "float", default: 0 })
  totalBeforeDiscount: number;

  @Column({ type: "float", default: 0 })
  discountAmount: number;

  @Column({ type: "float", default: 0 })
  finalAmount: number;

  @Column({ nullable: true })
  appliedCouponCode?: string;
}
