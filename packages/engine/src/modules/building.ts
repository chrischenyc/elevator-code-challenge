import EventLoop from './event-loop';
import Elevator, { ElevatorStatus } from './elevator';
import Passenger from './passenger';

class Building {
  public readonly floors: number;
  public readonly elevators: Elevator[] = [];
  public readonly queue: Passenger[] = []; // FIFO queue
  private readonly eventLoop: EventLoop = new EventLoop(this.eventLoopAction);

  constructor(floors: number) {
    this.floors = floors;

    this.floors;
    this.elevators;
    this.queue;
  }

  public addElevator(elevator: Elevator): void {
    if (this.elevators.find(elevator => elevator.id === elevator.id)) {
      throw new Error(`Building: elevator ${elevator.id} has already been installed`);
    }

    this.elevators.push(elevator);
    elevator.maxFloor = this.floors - 1;
    elevator.startOperation();
  }

  public removeElevator(elevator: Elevator): void {
    if (!this.elevators.includes(elevator)) {
      throw new Error(`Building: elevator ${elevator.id} hasn't been installed`);
    }

    elevator.stopOperation(); // elevator will be gracefully transited out of operation

    this.elevators.splice(this.elevators.indexOf(elevator), 1);
  }

  public startOperation(): void {
    this.eventLoop.start();
    this.elevators.forEach(elevator => elevator.startOperation());
  }

  public stopOperation(): void {
    this.elevators.forEach(elevator => elevator.stopOperation());
    this.eventLoop.stop();
  }

  public enqueuePassenger(passenger: Passenger): void {
    this.queue.push(passenger);
  }

  public dequeuePassenger(passenger: Passenger): void {
    this.queue.splice(this.queue.indexOf(passenger), 1);
  }

  /**
   * passenger -> elevator dispatching: attempt to dispatch the passengers to the available elevators that arrive with least time respectively
   */
  private eventLoopAction(): void {
    this.queue.forEach(passenger => {
      const elevatorsOrderedByArrivingTime = this.elevators
        .filter(elevator => elevator.status !== ElevatorStatus.STOPPED && elevator.status !== ElevatorStatus.STOPPING)
        .sort((a, b) => {
          return a.arrivingTimeToFloor(passenger.originFloor) - b.arrivingTimeToFloor(passenger.originFloor);
        });

      // enqueue passenger to the available elevator that requires least arriving time
      if (elevatorsOrderedByArrivingTime.length > 0) {
        const elevator = elevatorsOrderedByArrivingTime[0];
        elevator.enqueuePassenger(passenger);
        this.dequeuePassenger(passenger);
      }
    });
  }
}

export default Building;
