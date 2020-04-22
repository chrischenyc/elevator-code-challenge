import shortid from 'shortid';
import Passenger from '../passenger/passenger';
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
  public direction?: ElevatorDirection;
  public passengers: Passenger[] = []; // passengers currently riding the elevator
  public queue: Passenger[] = []; // queue for the passengers waiting to ride this elevator

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
   * floorSpeed: 1.25 seconds / floor
   * loading time: 2.5 seconds
   */
  public static sampleElevator(): Elevator {
    return new Elevator(10, 1250, 2500);
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
    logger.info(`Elevator ${this.id}: ${this.status} ${this.direction || ''} floor ${this.floor}`);

    switch (this.status) {
      case ElevatorStatus.IDLE:
        await this.handleIdleStatus();
        break;

      case ElevatorStatus.MOVING:
        this.handleMovingStatus();
        break;

      case ElevatorStatus.LOADING:
        this.handleLoadingStatus();
        break;

      case ElevatorStatus.NOT_IN_SERVICE:
        // return to break the event loop
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
        this.direction = undefined;
      } else {
        // otherwise, move to the first person in the queue
        this.status = ElevatorStatus.MOVING;
        this.direction = this.floor > this.queue[0].originFloor ? ElevatorDirection.DOWN : ElevatorDirection.UP;
      }
    }

    await this.evaluateStatus();
  }

  private async handleMovingStatus() {
    // wait for the required duration so elevator can reach the new floor
    await new Promise(r => setTimeout(r, this.floorSpeed));

    // update elevator's current floor
    this.floor += this.direction === ElevatorDirection.UP ? 1 : -1;

    // check if a loading/unloading is required on the current floor and transit to LOADING status
    const passengersToUnload = this.passengers.filter(passenger => passenger.destinationFloor === this.floor);
    const passengersWaiting = this.queue.filter(passenger => passenger.originFloor === this.floor);
    if (passengersToUnload.length > 0 || passengersWaiting.length > 0) {
      this.status = ElevatorStatus.LOADING;
      this.direction = undefined;
    }

    await this.evaluateStatus();
  }

  private async handleLoadingStatus() {
    // wait for the required duration so elevator can finish loading/unloading
    await new Promise(r => setTimeout(r, this.loadingSpeed));

    // unload passenger whose destination is current floor
    this.passengers = this.passengers.filter(passenger => passenger.destinationFloor !== this.floor);

    // load passengers waiting on current floor and going in same direction as the elevator
    for (const passenger of this.queue) {
      // ignore passenger not waiting on the current floor
      if (passenger.originFloor !== this.floor) {
        continue;
      }

      // ignore passenger going in the opposite direction
      if (
        (this.direction === ElevatorDirection.UP && passenger.originFloor > passenger.destinationFloor) ||
        (this.direction === ElevatorDirection.DOWN && passenger.originFloor < passenger.destinationFloor)
      ) {
        continue;
      }

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
      this.direction = passenger.destinationFloor > passenger.originFloor ? ElevatorDirection.UP : ElevatorDirection.DOWN;
    }

    await this.evaluateStatus();
  }
}

export default Elevator;
