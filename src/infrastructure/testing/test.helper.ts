export class TestHelper {
  /**
   * Lets the code wait for the given time in milliseconds.
   *
   * @param ms Time to wait in milliseconds
   */
  static async sleep(ms: number): Promise<void> {
    await new Promise((resolve) => setTimeout(() => resolve(true), ms));
  }

  /**
   * Lets the code wait until the given success check returns true.
   *
   * Example: <code>await TestHelper.waitUntil(() => database.isConnected());</code>
   *
   * @param successCheck Predicate returning <code>true</code> when we do not have to wait any longer, <code>false</code> otherwise
   * @param maxWaitMs Maximum time in milliseconds to wait for <code>successCheck</code> returning <code>true</code>
   */
  static async waitUntil(successCheck: () => Promise<boolean>, maxWaitMs: number = 8000): Promise<void> {
    const maxLoopCount = Math.ceil(maxWaitMs / 50);

    for (let i = 0; i < maxLoopCount; i++) {
      if (await successCheck()) {
        break;
      }

      await this.sleep(50);
    }
  }
}
