import Passenger from './passenger';
import { v4 as uuidv4 } from 'uuid';
import EventLoop from './event-loop';

export enum ElevatorStatus {
  STOPPED, // not in service
  STOPPING, // interim status before elevator goes out of service
  IDLE, // idle on a certain floor
  LOADING, // loading/unloading passengers
  MOVING, // moving up or down
}

export enum ElevatorDirection {
  UP, // elevator will continue going up
  DOWN, // elevator will continue going down
}

class Elevator {
  // immutable specs when elevator is manufactured
  public readonly id: string; // uuid
  public readonly capacity: number; // number of passengers the elevator can load
  public readonly speed: number; // seconds the elevator needs to travel one floor
  public readonly loadingDuration: number; // seconds the elevator needs for loading/unloading passenger(s)

  // run-time variables when elevator is in operation
  public maxFloor = 0;
  public floor = 0; // floor a idle/loading elevator is staying on, or the next floor a moving elevator is approaching
  public status: ElevatorStatus = ElevatorStatus.STOPPED;
  public direction?: ElevatorDirection;
  public passengers: Passenger[] = [];
  public queue: Passenger[] = []; // FIFO queue
  private readonly eventLoop: EventLoop;

  //
  /**
   * client can call this constructor to generate an elevator with customised specs
   */
  constructor(capacity: number, speed: number, loadingDuration: number) {
    this.id = uuidv4();
    this.capacity = capacity;
    this.speed = speed;
    this.loadingDuration = loadingDuration;
    this.eventLoop = new EventLoop(this.eventLoopAction, this.speed);
  }

  /**
   * client can call this factory method to quickly generate sample elevator instance with following specs:
   * max capacity: 12 passengers
   * speed: 2 seconds / floor
   * loading time: 10 seconds
   */
  public static sampleElevator(): Elevator {
    return new Elevator(12, 2, 10);
  }

  public startOperation(): void {
    if (this.status != ElevatorStatus.STOPPED) {
      return;
    }
    this.status = ElevatorStatus.IDLE;
    this.eventLoop.start();
  }

  /**
   * If the elevator is not moving, put it out of service immediately, elevator stays on the floor as is;
   * If the elevator is moving, transit its status to STOPPING, elevator will move to the next destination, and stay there;
   */
  public stopOperation(): void {
    if (this.status === ElevatorStatus.MOVING) {
      this.status = ElevatorStatus.STOPPING;
    } else {
      this.status = ElevatorStatus.STOPPED;
      this.eventLoop.stop();
    }
  }

  /**
   * calculate the optimal time for the elevator to arrive the designated floor
   *
   * @param floor - floor number where a passenger is calling for an elevator
   *
   * return: Number.MAX_SAFE_INTEGER if the elevator can't arrive the designated floor
   */
  public arrivingTimeToFloor(floor: number): number {
    // filter out elevator that has stopped or is stopping
    if (this.status === ElevatorStatus.STOPPED || this.status === ElevatorStatus.STOPPING) {
      return Number.MAX_SAFE_INTEGER;
    }

    // idle elevator can move directly to the designated floor
    if (this.status === ElevatorStatus.IDLE) {
      return Math.abs(floor - this.floor) * this.speed;
    }

    // if the loading elevator happens to be on the designated floor, it takes no time
    if (this.status === ElevatorStatus.LOADING && this.floor === floor) {
      return 0;
    }

    // TODO: otherwise, need to calculate the shortest time for elevator to arrive without affecting current passengers
    return Number.MAX_SAFE_INTEGER;
  }

  public enqueuePassenger(passenger: Passenger): void {
    this.queue.push(passenger);
  }

  public dequeuePassenger(passenger: Passenger): void {
    this.queue.splice(this.queue.indexOf(passenger), 1);
  }

  /**
   * elevator state-machine goes here:
   */
  private eventLoopAction(): void {
    switch (this.status) {
      case ElevatorStatus.STOPPED:
        break;
    }
  }
}

export default Elevator;
