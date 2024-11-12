/**
 * A utility class for introducing delays in asynchronous operations.
 */
export class Sleep {
  /**
   * The delay time in milliseconds for the sleep.
   * Defaults to 1000ms.
   */
  private delay = 1000;

  /**
   * Sets the delay time in milliseconds.
   * @param _delay - The delay in milliseconds to be set.
   * @returns The instance of the Sleep class, allowing method chaining.
   */
  public setTime = (_delay: number) => {
    this.delay = _delay;
    return this;
  };

  /**
   * Executes the sleep by introducing a delay based on the set `delay` time.
   * Returns a resolved promise once the delay is complete.
   * @returns A promise that resolves with a completion message after the delay.
   */
  public exec = async () => {
    await new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve("sleep execution completed");
      }, this.delay);
    });
  };
}
