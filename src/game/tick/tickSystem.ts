type TickCallback = (tickCount: number) => void;

export class TickSystem {
  private tickCount: number = 0;
  private isRunning: boolean = false;
  private animationFrameId: number | null = null;
  private callbacks: Set<TickCallback> = new Set();
  private lastTickTime: number = 0;
  private tickInterval: number;

  constructor(ticksPerSecond: number = 60) {
    this.tickInterval = 1000 / ticksPerSecond;
  }

  public start(): void {
    if (this.isRunning) {
      return;
    }
    this.isRunning = true;
    this.lastTickTime = performance.now();
    this.tick();
  }

  public stop(): void {
    this.isRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  public reset(): void {
    this.stop();
    this.tickCount = 0;
  }

  public getTickCount(): number {
    return this.tickCount;
  }

  public getIsRunning(): boolean {
    return this.isRunning;
  }

  public subscribe(callback: TickCallback): () => void {
    this.callbacks.add(callback);
    return () => {
      this.callbacks.delete(callback);
    };
  }

  public setTicksPerSecond(ticksPerSecond: number): void {
    this.tickInterval = 1000 / ticksPerSecond;
  }

  public getTicksPerSecond(): number {
    return Math.round(1000 / this.tickInterval);
  }

  private tick = (): void => {
    if (!this.isRunning) {
      return;
    }

    const currentTime = performance.now();
    const timeSinceLastTick = currentTime - this.lastTickTime;

    if (timeSinceLastTick >= this.tickInterval) {
      this.lastTickTime = currentTime - (timeSinceLastTick % this.tickInterval);
      this.tickCount++;
      
      this.callbacks.forEach((callback) => {
        try {
          callback(this.tickCount);
        } catch (error) {
          console.error('Tick callback error:', error);
        }
      });
    }

    this.animationFrameId = requestAnimationFrame(this.tick);
  };
}

export const globalTickSystem = new TickSystem(60);
