import { IsString, Length } from "class-validator";

export class VerifyOtpDto {
    @IsString()
    @Length(6, 8, { message: 'OTP must be exactly 6 characters long' })
    otp: string;
}