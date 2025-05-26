import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { IdeaModule } from './idea/idea.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { Contact } from './idea/entities/contact.mysql-entity';
import { User } from './idea/entities/user.mysql-entity';
import { Idea } from './idea/entities/idea.entity';
import { Role } from './idea/entities/role.entity';
import { AiChat } from './idea/entities/ai-chat.entity';
import { Choice } from './idea/entities/choice.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [`.env`],
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async () => ({
        type: 'mongodb',
        url: `${process.env.MONGO_TUTORIAL_URI}`,
        database: 'tutorial',
        synchronize: true,
        entities: [Idea, AiChat, Choice, Role],
      }), 
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      name: "mysql",
      useFactory: async () => ({
          type: "mysql",
          host: process.env.mysqlHost,
          port: Number(process.env.mysqlPort),
          username: "mean_pr",
          password: process.env.mysqlPw,
          database: "mean_pr",
          entities: [Contact, User],
          synchronize: false,
        })
    }),
    IdeaModule,
    AuthModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
