/**
 * @description TaskQueue is a generic class to manage and execute tasks sequentially.
 */
class TaskQueue<T> {
  private queue: Array<() => Promise<T>> = [];
  private isProcessing: boolean = false;

  /**
   * @description Adds a task to the queue.
   * @param task - A function that returns a Promise.
   */
  public enqueue(task: () => Promise<T>): void {
    this.queue.push(task);
    this.processQueue();
  }

  /**
   * @description Processes the queue, ensuring tasks are executed sequentially.
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing) return;

    this.isProcessing = true;
    while (this.queue.length > 0) {
      const task = this.queue.shift();
      if (task) {
        await task();
      }
    }
    this.isProcessing = false;
  }
}

export { TaskQueue };
