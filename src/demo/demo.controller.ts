import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { DemoDto } from './demo.dto';
import { DemoService } from './demo.service';
import { CreateDemoDto } from './create-demo.dto';

@Controller()
@ApiTags('Demo')
export class DemoController {
  constructor(private readonly demoService: DemoService) {}

  @Get('/api/demos')
  @ApiResponse({
    status: 200,
    description: 'All demos',
    type: DemoDto,
    isArray: true
  })
  getDemos(): Promise<DemoDto[]> {
    return this.demoService.getDemos();
  }

  @Post('/api/demos')
  @ApiResponse({
    status: 201,
    description: 'The demo has been created successfully',
    type: DemoDto
  })
  @ApiResponse({ status: 400 })
  createDemo(@Body() createDemoDto: CreateDemoDto): Promise<DemoDto> {
    return this.demoService.createDemo(createDemoDto);
  }
}
