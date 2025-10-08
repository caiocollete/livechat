// src/chat/dto/create-message.dto.ts
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateMessageDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  text: string;

  @IsString()
  @IsNotEmpty()
  date: string;
}
