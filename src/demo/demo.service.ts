import crypto = require('crypto');
import { Injectable } from '@nestjs/common';
import { DemoDto } from './demo.dto';
import { CreateDemoDto } from './create-demo.dto';

@Injectable()
export class DemoService {
  private demos: DemoDto[] = [];

  getDemos(): Promise<DemoDto[]> {
    return Promise.resolve(this.demos);
  }

  createDemo(createDemoDto: CreateDemoDto): Promise<DemoDto> {
    const demoDto = new DemoDto(Object.assign({}, createDemoDto, { id: crypto.randomBytes(16).toString('hex') }));
    this.demos.push(Object.assign({}, createDemoDto, { id: crypto.randomBytes(16).toString('hex') }));
    return Promise.resolve(demoDto);
  }
}
