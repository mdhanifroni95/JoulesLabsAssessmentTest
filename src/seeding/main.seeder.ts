import { DataSource } from "typeorm";
import { Seeder, SeederFactoryManager } from "typeorm-extension";
import { CouponEntity } from "../entities/coupon.entity";

export class MainSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<any> {
    const couponFactory = factoryManager.get(CouponEntity);

    console.log("Seeding coupons...");
    await couponFactory.saveMany(20); // generates and inserts 20 coupons
  }
}
