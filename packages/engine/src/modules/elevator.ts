import Passenger from './passenger';
import { v4 as uuidv4 } from 'uuid';
import EventLoop from './event-loop';

export enum ElevatorStatus {
  NOT_IN_OPERATION, // elevator can't be used
  STOPPING_OPERATION, // interim status from GOING_UP/GOING_DOWN to NOT_IN_OPERATION
  IDLE, // elevator is idle on a certain floor
  UP, // elevator is moving up
  DOWN, // elevator is moving down
  LOADING, // loading/unloading passengers
}

class Elevator {
  // immutable specs when elevator is manufactured
  public readonly id: string; // uuid
  public readonly capacity: number; // number of passengers the elevator can load
  public readonly speed: number; // seconds the elevator needs to travel one floor
  public readonly loadingDuration: number; // seconds the elevator needs for loading/unloading passenger(s)

  // run-time variables when elevator is in operation
  public maxFloor: number;
  public floor = 0; // floor a idle/loading elevator is staying on, or the next floor a moving elevator is approaching
  public status: ElevatorStatus = ElevatorStatus.NOT_IN_OPERATION;
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
    this.maxFloor = 0;
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
    if (this.status != ElevatorStatus.NOT_IN_OPERATION) {
      return;
    }
    this.status = ElevatorStatus.IDLE;
    this.eventLoop.start();
  }

  /**
   * If the elevator is not moving, put it out of service immediately, elevator stays on the floor as is;
   * If the elevator is moving, transit its status to STOPPING_OPERATION, elevator will move to the next destination, and stay there;
   */
  public stopOperation(): void {
    if (this.status === ElevatorStatus.UP || this.status === ElevatorStatus.DOWN) {
      this.status = ElevatorStatus.STOPPING_OPERATION;
    } else {
      this.status = ElevatorStatus.NOT_IN_OPERATION;
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
    // filter out elevator that has stopped or is stopping operation
    if (this.status === ElevatorStatus.NOT_IN_OPERATION || this.status === ElevatorStatus.STOPPING_OPERATION) {
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

    // TODO: otherwise, need to calculate the shortest time the elevator might take without affecting existing passengers
    return Math.abs(floor - this.floor) * this.speed;
  }

  public enqueuePassenger(passenger: Passenger): void {
    this.queue.push(passenger);
    // TODO: re-arrange FIFO queue
  }

  public dequeuePassenger(passenger: Passenger): void {
    this.queue.splice(this.queue.indexOf(passenger), 1);
    // TODO: re-arrange FIFO queue
  }

  /**
   * elevator state-machine goes here:
   */
  private eventLoopAction(): void {}
}

export default Elevator;
