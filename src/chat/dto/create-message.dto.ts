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

export class CreateWhisperDto {
  @IsString()
  @IsNotEmpty()
  destinationSessionId: string;

  @IsString()
  @IsNotEmpty()
  text: string;
}

export class CreateWhisperResponseDto {
  @IsString()
  @IsNotEmpty()
  fromName: string;

  @IsString()
  @IsNotEmpty()
  text: string;

  @IsString()
  @IsNotEmpty()
  date: string;
}
