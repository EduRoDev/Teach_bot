import { IsEmail, IsString, Length } from "class-validator"

export class VerifyResetDto {
    @IsEmail()
    email: string

    @IsString()
    @Length(6, 8, { message: 'OTP must be between 6 and 8 characters' })
    otp: string
}