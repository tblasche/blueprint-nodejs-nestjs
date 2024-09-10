import { Injectable } from '@nestjs/common';
import { CreateDemoDto } from './create-demo.dto';
import { PrismaService } from '../infrastructure/db/prisma.service';
import { DemoDto } from './demo.dto';
import { Demo } from '@prisma/client';

@Injectable()
export class DemoService {
  constructor(private readonly prismaService: PrismaService) {}

  getDemos(): Promise<DemoDto[]> {
    return this.prismaService.demo.findMany().then((entities: Demo[]) => this.demoEntitiesToDemoDtos(entities));
  }

  createDemo(createDemoDto: CreateDemoDto): Promise<DemoDto> {
    return this.prismaService.demo
      .create({
        data: {
          title: createDemoDto.title,
          description: createDemoDto.description
        }
      })
      .then((entity: Demo) => this.demoEntityToDemoDto(entity));
  }

  private demoEntitiesToDemoDtos(entities: Demo[]): DemoDto[] {
    return entities.map((entity) => this.demoEntityToDemoDto(entity));
  }

  private demoEntityToDemoDto(entity: Demo): DemoDto {
    return new DemoDto({
      id: entity.id,
      title: entity.title,
      description: entity.description,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt
    });
  }
}