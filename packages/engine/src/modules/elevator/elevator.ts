import { v4 as uuidv4 } from 'uuid';
import Passenger from '../passenger/passenger';
import EventLoop from '../../utils/event-loop';
import { logger } from '@utils/logger';

export enum ElevatorStatus {
  NOT_IN_SERVICE = 'Not in service',
  IDLE = 'Idle',
  MOVING = 'Moving',
  LOADING = 'Loading',
}

export enum ElevatorDirection {
  UP = 'Up',
  DOWN = 'Down',
}

const ElevatorEventLoopInterval = 1000;

class Elevator {
  // immutable specs when elevator is manufactured
  public readonly id: string; // uuid
  public readonly capacity: number; // number of passengers the elevator can load
  public readonly floorSpeed: number; // seconds the elevator needs to travel one floor
  public readonly loadingSpeed: number; // seconds the elevator needs for loading/unloading passenger(s)

  // run-time variables when elevator is in operation
  public maxFloor = 0;
  public floor = 0; // floor a idle/loading elevator is staying on, or the next floor a moving elevator is approaching
  public status: ElevatorStatus = ElevatorStatus.NOT_IN_SERVICE;
  public direction?: ElevatorDirection;
  public passengers: Passenger[] = [];
  public queue: Passenger[] = []; // FIFO queue for the passengers waiting to ride this elevator

  private readonly eventLoop: EventLoop = new EventLoop(this.eventLoopAction, ElevatorEventLoopInterval); // keeps updating elevator current floor

  //
  /**
   * client can call this constructor to generate an elevator with customised specs
   */
  constructor(capacity: number, floorSpeed: number, loadingSpeed: number) {
    this.id = uuidv4();
    this.capacity = capacity;
    this.floorSpeed = floorSpeed;
    this.loadingSpeed = loadingSpeed;
  }

  /**
   * client can call this factory method to quickly generate sample elevator instance with following specs:
   * max capacity: 10 passengers
   * floorSpeed: 2 seconds / floor
   * loading time: 10 seconds
   */
  public static sampleElevator(): Elevator {
    return new Elevator(10, 2, 10);
  }

  public startOperation(): void {
    if (this.status === ElevatorStatus.NOT_IN_SERVICE) {
      this.status = ElevatorStatus.IDLE;
      this.eventLoop.start();

      logger.info(`Elevator ${this.id}: started`);
    }
  }

  /**
   * put the elevator out of service immediately, elevator stays on the floor as is
   */
  public stopOperation(): void {
    this.status = ElevatorStatus.NOT_IN_SERVICE;
    this.eventLoop.stop();

    logger.info(`Elevator ${this.id}: stopped`);
  }

  public static elevatorToEnqueue(elevators: Elevator[], passenger: Passenger): Elevator | null {
    const elevatorsSortedByArrivingTime = elevators
      .map(elevator => {
        return { elevator, arrivingTime: elevator.arrivingTimeForPassenger(passenger) };
      })
      .sort((a, b) => {
        return a.arrivingTime - b.arrivingTime;
      });

    if (elevatorsSortedByArrivingTime[0].arrivingTime === Number.MAX_SAFE_INTEGER) {
      return null;
    }

    return elevatorsSortedByArrivingTime[0].elevator;
  }

  /**
   * calculate the shortest time for the elevator to arrive the designated floor without affecting current itinerary
   *
   * return: Number.MAX_SAFE_INTEGER if the elevator can't arrive the designated floor
   */
  public arrivingTimeForPassenger(passenger: Passenger): number {
    switch (this.status) {
      case ElevatorStatus.IDLE:
        return Math.abs(passenger.originFloor - this.floor) * this.floorSpeed;

      case ElevatorStatus.NOT_IN_SERVICE:
        return Number.MAX_SAFE_INTEGER;

      case ElevatorStatus.MOVING:
      case ElevatorStatus.LOADING:
        if (this.passengers.length === this.capacity) {
          return Number.MAX_SAFE_INTEGER;
        }

        const passengerDirection = passenger.originFloor > passenger.destinationFloor ? ElevatorDirection.DOWN : ElevatorDirection.UP;
        if (
          this.direction &&
          this.direction === passengerDirection &&
          ((this.direction === ElevatorDirection.DOWN && this.floor > passenger.originFloor) ||
            (this.direction === ElevatorDirection.UP && this.floor < passenger.originFloor))
        ) {
          return Math.abs(passenger.originFloor - this.floor) * this.floorSpeed;
        }
    }

    return Number.MAX_SAFE_INTEGER;
  }

  public enqueue(passenger: Passenger): void {
    if (this.status === ElevatorStatus.NOT_IN_SERVICE) {
      logger.warn(`Elevator ${this.id}: cannot enqueue passenger, out of service`);
      throw new Error('Elevator: cannot enqueue passenger, out of service');
    }

    if (
      passenger.destinationFloor === passenger.originFloor ||
      passenger.destinationFloor > this.maxFloor ||
      passenger.originFloor > this.maxFloor
    ) {
      logger.warn(`Elevator ${this.id}: cannot enqueue passenger, invalid origin or destination floor`);
      throw new Error('Elevator: cannot enqueue passenger with invalid origin or destination floor');
    }

    this.queue.push(passenger);
  }

  /**
   * core event-loop to update elevator run-time properties, i.e.: status, direction, passengers, queue, floor
   */
  private eventLoopAction(): void {
    logger.info(`Elevator ${this.id}: status ${this.status} direction ${this.direction}`);

    switch (this.status) {
      case ElevatorStatus.IDLE:
        if (this.queue.length === 0) {
          // nobody is on its waiting list, do nothing
        } else {
          if (this.queue.find(passenger => passenger.originFloor === this.floor)) {
            // someone is waiting for elevator's floor, start loading immediately
            this.status = ElevatorStatus.LOADING;
          } else {
            // otherwise, move to the first person in the queue
            this.status = ElevatorStatus.MOVING;
            this.direction = this.floor > this.queue[0].originFloor ? ElevatorDirection.DOWN : ElevatorDirection.UP;
          }
        }
        break;

      case ElevatorStatus.MOVING:
        // calculate the current floor
        let newFloor = this.floor;
        if (this.direction === ElevatorDirection.DOWN) {
          newFloor = Math.ceil(this.floor - ElevatorEventLoopInterval / this.floorSpeed);
        } else if (this.direction === ElevatorDirection.UP) {
          newFloor = Math.floor(this.floor + ElevatorEventLoopInterval / this.floorSpeed);
        }

        // elevator has reached a new floor
        if (newFloor !== this.floor) {
          this.floor = newFloor;

          const passengersToUnload = this.passengers.filter(passenger => passenger.destinationFloor === this.floor);
          const passengersWaiting = this.queue.filter(passenger => passenger.originFloor === this.floor);
          // someone wants to get out/in the elevator, transit elevator status to LOADING
          if (passengersToUnload.length > 0 || passengersWaiting.length > 0) {
            this.status = ElevatorStatus.LOADING;

            // unload passengers
            this.passengers = this.passengers.filter(passenger => passenger.destinationFloor !== this.floor);

            // load passengers
            const numberOfPassengersToLoad = Math.min(this.capacity - this.passengers.length, passengersWaiting.length);
            for (let i = 0; i < numberOfPassengersToLoad; i++) {
              const passengerToLoad = passengersWaiting[i];
              this.passengers.push(passengerToLoad);
              this.queue.splice(this.queue.indexOf(passengerToLoad), 1);
            }

            setTimeout(() => {
              if (this.passengers.length === 0) {
                // transit to IDLE status if the elevator is empty after loading/unloading
                this.status = ElevatorStatus.IDLE;
                this.direction = undefined;
              } else {
                // resume to MOVING status if the elevator still has passengers
                this.status = ElevatorStatus.MOVING;
              }
            }, this.loadingSpeed);
          }
        }
        break;

      default:
        break;
    }
  }
}

export default Elevator;
