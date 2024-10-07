export class TestHelper {
  static async sleep(ms: number): Promise<void> {
    await new Promise((resolve) => setTimeout(() => resolve(true), ms));
  }
}
