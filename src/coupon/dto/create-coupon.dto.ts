import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from "class-validator";
import { DiscountType } from "src/utils/enum";

export class CreateCouponDto {
  @IsNotEmpty()
  @IsString()
  code: string;

  @IsNotEmpty()
  @IsEnum(DiscountType)
  discountType: DiscountType; // "FIXED" | "PERCENTAGE"

  @IsNotEmpty()
  @IsNumber()
  value: number;

  @IsNotEmpty()
  startAt?: Date;

  @IsNotEmpty()
  endAt?: Date;

  @IsOptional()
  @IsNumber()
  maxDiscountAmount?: number;

  @IsOptional()
  @IsNumber()
  minCartItems?: number;

  @IsOptional()
  @IsNumber()
  minTotalPrice?: number;

  @IsOptional()
  @IsArray()
  productIds?: string[];

  @IsOptional()
  @IsBoolean()
  autoApply?: boolean;

  @IsOptional()
  @IsNumber()
  maxUses?: number;

  @IsOptional()
  @IsNumber()
  maxUsesPerUser?: number;
}
