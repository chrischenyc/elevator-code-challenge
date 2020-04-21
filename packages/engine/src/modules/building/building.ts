import EventLoop from '../../utils/event-loop';
import Elevator from '../elevator/elevator';
import Passenger from '../passenger/passenger';

class Building {
  public readonly floors: number;
  public readonly elevators: Elevator[] = [];
  public readonly queue: Passenger[] = []; // FIFO queue

  private readonly eventLoop: EventLoop = new EventLoop(this.eventLoopAction); // keeps dispatching passengers in queue

  constructor(floors: number) {
    this.floors = floors;
  }

  public startOperation(): void {
    this.eventLoop.start();
    this.elevators.forEach(elevator => elevator.startOperation());
  }

  public stopOperation(): void {
    this.elevators.forEach(elevator => elevator.stopOperation());
    this.eventLoop.stop();
  }

  public addElevator(elevator: Elevator): void {
    if (this.elevators.find(elevator => elevator.id === elevator.id)) {
      throw new Error(`Building: elevator ${elevator.id} has already been installed`);
    }

    this.elevators.push(elevator);
    elevator.maxFloor = this.floors - 1;
  }

  public removeElevator(elevator: Elevator): void {
    if (!this.elevators.includes(elevator)) {
      throw new Error(`Building: elevator ${elevator.id} hasn't been installed`);
    }

    this.elevators.splice(this.elevators.indexOf(elevator), 1);
  }

  public enqueue(passenger: Passenger): void {
    this.queue.push(passenger);
  }

  private dequeuePassenger(passenger: Passenger): void {
    this.queue.splice(this.queue.indexOf(passenger), 1);
  }

  /**
   * the event loop keeps dispatching the waiting passenger(s) to the most suitable elevator(s)
   */
  private eventLoopAction(): void {
    this.queue.forEach(passenger => {
      const elevator = Elevator.elevatorToEnqueue(this.elevators, passenger);

      // enqueue passenger to the available elevator that requires least arriving time
      if (elevator) {
        elevator.enqueue(passenger);
        this.dequeuePassenger(passenger);
      }
    });
  }
}

export default Building;
