import { IsString, IsNotEmpty, IsArray } from 'class-validator';
import { ChatMessage } from '../entities/ai-chat.entity';

export class ChatResponseDto {

    @IsNotEmpty()
    @IsString()
    id: string;

    @IsArray()
    chatMessages: ChatMessage[];

}