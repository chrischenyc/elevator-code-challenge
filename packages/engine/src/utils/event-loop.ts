class EventLoop {
  private readonly action: VoidFunction;
  private readonly interval: number;
  private timeout?: NodeJS.Timeout;

  constructor(action: VoidFunction, interval = 1000) {
    if (interval <= 0) {
      throw new Error('EventLoop: please user interval greater than 0');
    }
    this.action = action;
    this.interval = interval;
  }

  public start(): void {
    if (this.timeout) {
      return;
    }

    this.timeout = setInterval(this.action, this.interval);
  }

  public stop(): void {
    if (!this.timeout) {
      return;
    }

    clearInterval(this.timeout);
    this.timeout = undefined;
  }
}

export default EventLoop;
