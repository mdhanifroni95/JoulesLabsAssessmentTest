import dbConfig from "../config/db.config";
import { DataSource, DataSourceOptions } from "typeorm";
import { runSeeder, runSeeders, SeederOptions } from "typeorm-extension";
import { MainSeeder } from "./main.seeder";
import { CouponFactory } from "./coupon.factory";

const options: DataSourceOptions & SeederOptions = {
  ...dbConfig(),
  factories: [CouponFactory],
  seeds: [MainSeeder],
};

const datasource = new DataSource(options);
datasource.initialize().then(async () => {
  await datasource.synchronize(true);
  await runSeeders(datasource);
  process.exit();
});
