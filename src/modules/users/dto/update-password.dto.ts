import { ApiProperty } from "@nestjs/swagger";
import { IsString, MinLength } from "class-validator";

export class UpdatePasswordDto {   
    @ApiProperty({type:"string"})
    @IsString()
    @MinLength(5)
    current_password!:string
    
    @ApiProperty({type:"string"})
    @IsString()
    @MinLength(5)
    new_password!:string
    
    @ApiProperty({type:"string"})
    @IsString()
    @MinLength(5)
    confirm_password!:string
}