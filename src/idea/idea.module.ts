import { Module } from '@nestjs/common';
import { IdeaService } from './idea.service';
import { IdeaController } from './idea.controller';
import { Idea } from './entities/idea.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Idea])],
  controllers: [IdeaController],
  providers: [IdeaService],
})
export class IdeaModule {}
