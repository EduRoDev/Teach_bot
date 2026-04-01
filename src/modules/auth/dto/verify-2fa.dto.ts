import { IsString, Length } from "class-validator"

export class Verify2FADto {
    @IsString()
    tempToken: string

    @IsString()
    @Length(6, 8, { message: 'Code must be between 6 and 8 characters' })
    code: string
}