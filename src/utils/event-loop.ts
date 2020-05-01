class EventLoop {
  private readonly action: VoidFunction;
  private readonly interval: number;
  private timeout?: NodeJS.Timeout;

  constructor(action: VoidFunction, interval = 1) {
    if (interval <= 0) {
      throw new Error('EventLoop: please user interval greater than 0');
    }
    this.action = action;
    this.interval = interval;
  }

  public start() {
    if (this.timeout) {
      return;
    }

    this.timeout = setInterval(this.action, this.interval * 1000);
  }

  public stop() {
    if (!this.timeout) {
      return;
    }

    clearInterval(this.timeout);
    this.timeout = undefined;
  }
}

export default EventLoop;
