import Passenger from './passenger';
import { v4 as uuidv4 } from 'uuid';

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
  public readonly speed: number; // number of floors the elevator can travel per second
  public readonly loadingDuration: number; // seconds the elevator needs for loading/unloading passenger(s)

  // run-time variables when elevator is in operation
  public floor = 0; // floor a idle/loading elevator is staying on, or the next floor a moving elevator is approaching
  public status: ElevatorStatus = ElevatorStatus.NOT_IN_OPERATION;
  public passengers: Passenger[] = [];
  public queue: Passenger[] = [];

  // TODO: EventLoop property

  //
  /**
   * client can call this constructor to generate an elevator with customised specs
   * @param capacity - number of passengers the elevator can load
   * @param speed - number of floors the elevator can travel per second
   * @param loadingDuration - seconds the elevator needs for loading/unloading passenger(s)
   */
  constructor(capacity: number, speed: number, loadingDuration: number) {
    this.id = uuidv4();
    // TODO: EventLoop instance
    this.capacity = capacity;
    this.speed = speed;
    this.loadingDuration = loadingDuration;
  }

  /**
   * client can call this factory method to quickly generate sample elevator instance with following specs:
   * max capacity: 12 passengers
   * speed: 2 seconds / floor, or 0.5 floor / second
   * loading time: 10 seconds
   */
  public static sampleElevator(): Elevator {
    return new Elevator(12, 0.5, 10);
  }

  public startOperation(): void {
    if (this.status != ElevatorStatus.NOT_IN_OPERATION) {
      return;
    }
    this.status = ElevatorStatus.IDLE;
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
    }
  }
}

export default Elevator;
