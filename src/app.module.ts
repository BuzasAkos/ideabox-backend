import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { IdeaModule } from './idea/idea.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

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
        entities: [__dirname + '/**/*.entity{.ts,.js}'], // Point to entities directory
      }), 
    }),
    IdeaModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
