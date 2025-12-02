import { Injectable } from '@nestjs/common';
import { CreateDemoDto } from './create-demo.dto';
import { PrismaService } from '../infrastructure/db/prisma.service';
import { DemoDto } from './demo.dto';
import { demo as DemoEntity } from '../infrastructure/db/generated/prisma/client';

@Injectable()
export class DemoService {
  constructor(private readonly prismaService: PrismaService) {}

  async getDemos(): Promise<DemoDto[]> {
    const entities = await this.prismaService.demo.findMany();
    return this.demoEntitiesToDemoDtos(entities);
  }

  async createDemo(createDemoDto: CreateDemoDto): Promise<DemoDto> {
    const entity = await this.prismaService.demo.create({
      data: {
        title: createDemoDto.title,
        description: createDemoDto.description
      }
    });
    return this.demoEntityToDemoDto(entity);
  }

  private demoEntitiesToDemoDtos(entities: DemoEntity[]): DemoDto[] {
    return entities.map((entity) => this.demoEntityToDemoDto(entity));
  }

  private demoEntityToDemoDto(entity: DemoEntity): DemoDto {
    return new DemoDto({
      id: entity.id,
      title: entity.title,
      description: entity.description || undefined,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt
    });
  }
}
