import shortid from 'shortid';
import Passenger from '../passenger/passenger';
import { logger } from '@utils/logger';

export enum ElevatorStatus {
  NOT_IN_SERVICE = 'Not in service',
  IDLE = 'Idle',
  MOVING = 'Moving',
  LOADING = 'Loading',
}

export enum Direction {
  UP = 'Up',
  DOWN = 'Down',
}

class Elevator {
  // immutable specs when elevator is manufactured
  public readonly id: string; // uuid
  public readonly capacity: number; // number of passengers the elevator can load
  public readonly floorSpeed: number; // milliseconds the elevator needs to travel one floor
  public readonly loadingSpeed: number; // milliseconds the elevator needs for loading/unloading passenger(s)

  // run-time variables when elevator is in operation
  public maxFloor = 0;
  public floor = 0; // floor a idle/loading elevator is staying on, or the next floor a moving elevator is approaching
  public status: ElevatorStatus = ElevatorStatus.NOT_IN_SERVICE;
  public direction?: Direction;
  public passengers: Passenger[] = []; // passengers currently riding the elevator
  public queue: Passenger[] = []; // First-In-First-Serve queue for the passengers waiting to ride this elevator

  //
  /**
   * client can call this constructor to generate an elevator with customised specs
   */
  constructor(capacity: number, floorSpeed: number, loadingSpeed: number) {
    this.id = shortid.generate();
    this.capacity = capacity;
    this.floorSpeed = floorSpeed;
    this.loadingSpeed = loadingSpeed;
  }

  /**
   * client can call this factory method to quickly generate sample elevator instance with following specs:
   * max capacity: 10 passengers
   * floorSpeed: 1.00 seconds / floor
   * loading time: 2.00 seconds
   */
  public static sampleElevator(): Elevator {
    return new Elevator(10, 1000, 2000);
  }

  public startOperation() {
    if (this.status === ElevatorStatus.NOT_IN_SERVICE) {
      this.status = ElevatorStatus.IDLE;

      logger.info(`Elevator ${this.id}: Started`);

      // start event-loop
      this.evaluateStatus();
    }
  }

  /**
   * put the elevator out of service immediately, elevator stays on the floor as is
   */
  public stopOperation() {
    this.status = ElevatorStatus.NOT_IN_SERVICE;

    logger.info(`Elevator ${this.id}: Stopped`);
  }

  /**
   * Select the most suitable elevator for a waiting passenger to be enqueued
   *
   * return: null if on suitable elevator can be used at the moment
   */
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
   * calculate the shortest time for the elevator to arrive passenger's origin floor without affecting current passengers' itinerary
   *
   * return: Number.MAX_SAFE_INTEGER if the elevator can't arrive the designated floor at the moment
   */
  private arrivingTimeForPassenger(passenger: Passenger): number {
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

        if (
          this.direction &&
          this.direction === passenger.direction &&
          ((this.direction === Direction.DOWN && this.floor > passenger.originFloor) ||
            (this.direction === Direction.UP && this.floor < passenger.originFloor))
        ) {
          return Math.abs(passenger.originFloor - this.floor) * this.floorSpeed;
        }
    }

    return Number.MAX_SAFE_INTEGER;
  }

  public enqueue(passenger: Passenger) {
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
   * core logic to orchestrate elevator status transitions
   */
  private async evaluateStatus() {
    switch (this.status) {
      case ElevatorStatus.IDLE:
        logger.info(`Elevator ${this.id}: ${this.status}, floor ${this.floor}`);
        await this.handleIdleStatus();
        break;

      case ElevatorStatus.MOVING:
        logger.info(`Elevator ${this.id}: ${this.status} ${this.direction || ''}, floor ${this.floor}`);
        this.handleMovingStatus();
        break;

      case ElevatorStatus.LOADING:
        logger.info(`Elevator ${this.id}: ${this.status}, floor ${this.floor}`);
        this.handleLoadingStatus();
        break;

      case ElevatorStatus.NOT_IN_SERVICE:
        return;
    }
  }

  private async handleIdleStatus() {
    if (this.queue.length === 0) {
      // nobody is waiting for the elevator, re-evaluate after 1 second
      await new Promise(r => setTimeout(r, 1000));
    } else {
      // someone is waiting on the elevator's floor, start loading immediately
      if (this.queue.find(passenger => passenger.originFloor === this.floor)) {
        this.status = ElevatorStatus.LOADING;
      } else {
        // otherwise, move to the first person in the queue
        this.status = ElevatorStatus.MOVING;
        this.direction = this.floor > this.queue[0].originFloor ? Direction.DOWN : Direction.UP;
      }
    }

    await this.evaluateStatus();
  }

  private async handleMovingStatus() {
    // wait for the required duration so elevator can reach the new floor
    await new Promise(r => setTimeout(r, this.floorSpeed));

    // update elevator's current floor
    this.floor += this.direction === Direction.UP ? 1 : -1;

    // check if a loading/unloading is required on the current floor and transit to LOADING status
    const passengersToUnload = this.passengers.filter(passenger => passenger.destinationFloor === this.floor);
    const passengersToLoad = this.passengersToLoad();

    if (passengersToUnload.length > 0 || passengersToLoad.length > 0) {
      this.status = ElevatorStatus.LOADING;
    }

    await this.evaluateStatus();
  }

  private async handleLoadingStatus() {
    // wait for the required duration so elevator can finish loading/unloading
    await new Promise(r => setTimeout(r, this.loadingSpeed));

    // unload passenger whose destination is current floor
    this.passengers = this.passengers.filter(passenger => passenger.destinationFloor !== this.floor);

    // load passengers waiting on current floor and going in same direction as the elevator
    for (const passenger of this.passengersToLoad()) {
      // elevator is full
      if (this.passengers.length === this.capacity) {
        break;
      }

      // load the passenger from the queue
      this.passengers.push(passenger);
      this.queue.splice(this.queue.indexOf(passenger), 1);
    }

    // decide next status after loading/unloading

    if (this.passengers.length === 0) {
      // elevator is fully unloaded, transit to IDLE status
      this.status = ElevatorStatus.IDLE;
      this.direction = undefined;
    } else {
      // resume MOVING status, in the direction of the first passenger
      this.status = ElevatorStatus.MOVING;
      const passenger = this.passengers[0];
      this.direction = passenger.destinationFloor > passenger.originFloor ? Direction.UP : Direction.DOWN;
    }

    await this.evaluateStatus();
  }

  /**
   * Based on elevator's run-time values, determine if a passenger can be loaded on the current floor.
   * The potential loading shouldn't affect First-In-First-Serve principle of the waiting queue
   */
  private passengersToLoad(): Passenger[] {
    const passengersToLoad: Passenger[] = [];

    let maxFloorBeforeGoDown: number | undefined;
    let minFloorBeforeGoUP: number | undefined;

    for (const passenger of this.queue) {
      logger.debug(
        `floor ${this.floor} minFloorBeforeGoUP ${minFloorBeforeGoUP || '--'} maxFloorBeforeGoDown ${maxFloorBeforeGoDown || '--'}`,
      );

      // ignore passenger not waiting on the current floor
      if (passenger.originFloor === this.floor) {
        // passenger is going in the same direction as elevator's current direction
        if (!this.direction || passenger.direction === this.direction) {
          // consider loading this passenger if the destination floor won't affect other passengers ahead in the waiting queue
          if (
            (passenger.direction === Direction.UP && (!maxFloorBeforeGoDown || passenger.destinationFloor <= maxFloorBeforeGoDown)) ||
            (passenger.direction === Direction.DOWN && (!minFloorBeforeGoUP || passenger.destinationFloor >= minFloorBeforeGoUP))
          ) {
            logger.debug('Eligible passenger to load', passenger);
            passengersToLoad.push(passenger);
          }
        }
        // passenger is going in the opposite direction as elevator's current direction
        else {
          // consider loading this passenger if the elevator can turn around without affecting passengers riding it and passengers ahead in the waiting queue
          if (
            this.passengers.length === 0 &&
            ((passenger.direction === Direction.UP && (!minFloorBeforeGoUP || minFloorBeforeGoUP > this.floor)) ||
              (passenger.direction === Direction.DOWN && (!maxFloorBeforeGoDown || maxFloorBeforeGoDown <= this.floor)))
          ) {
            logger.debug('Eligible passenger to load', passenger);
            passengersToLoad.push(passenger);
          }
        }
      }

      // this waiting passenger's priority is higher than the following ones in the queue
      if (passenger.direction === Direction.DOWN && (!maxFloorBeforeGoDown || passenger.originFloor < maxFloorBeforeGoDown)) {
        maxFloorBeforeGoDown = passenger.originFloor;
      }

      if (passenger.direction === Direction.UP && (!minFloorBeforeGoUP || passenger.originFloor > minFloorBeforeGoUP)) {
        minFloorBeforeGoUP = passenger.originFloor;
      }
    }

    return passengersToLoad;
  }
}

export default Elevator;
