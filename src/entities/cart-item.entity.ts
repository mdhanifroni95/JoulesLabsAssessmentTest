import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Cart } from "./cart.entity";

@Entity({ name: "cart_items" })
export class CartItem {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => Cart, (cart) => cart.items, { onDelete: "CASCADE" })
  cart: Cart;

  @Column()
  productId: string;

  @Column({ type: "float" })
  unitPrice: number;

  @Column({ type: "float" })
  quantity: number;
}
