import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule } from "@nestjs/config";
import { CartModule } from './cart/cart.module';
import { CouponModule } from './coupon/coupon.module';
import dbConfig from "./config/db.config";
import dbConfigProduction from "./config/db.config.production";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
      load: [dbConfig, dbConfigProduction]
    }),
    TypeOrmModule.forRootAsync({ useFactory: process.env.NODE_ENV === "production" ? dbConfigProduction : dbConfig }),
    CartModule,
    CouponModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
