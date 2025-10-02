import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class ApplyCouponDto {
  @IsOptional()
  @IsString()
  code: string;
}
