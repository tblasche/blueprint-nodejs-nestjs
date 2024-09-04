export class DemoDto {
  id: string;
  title: string;
  description?: string;

  constructor(props: Partial<DemoDto> = {}) {
    Object.assign(this, props);
  }
}
