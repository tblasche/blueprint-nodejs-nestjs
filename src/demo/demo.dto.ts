export class DemoDto {
  id: string;
  title: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(props: Partial<DemoDto> = {}) {
    Object.assign(this, props);
  }
}
