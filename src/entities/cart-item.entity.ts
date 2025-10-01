import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { CartEntity } from "./cart.entity";

@Entity({ name: "cart_items" })
export class CartItemEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => CartEntity, (cart) => cart.items, { onDelete: "CASCADE" })
  cart: CartEntity;

  @Column()
  productId: string;

  @Column({ type: "float" })
  unitPrice: number;

  @Column({ type: "float" })
  quantity: number;
}
