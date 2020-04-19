import Elevator from 'modules/elevator';
import Passenger from 'modules/passenger';

class Building {
  public readonly floors: number;
  public readonly elevators: Elevator[] = [];
  public readonly queue: Passenger[] = [];

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
    this.elevators.forEach(elevator => elevator.startOperation());
  }

  public stopOperation(): void {
    this.elevators.forEach(elevator => elevator.stopOperation());
  }

  public enqueuePassenger(passenger: Passenger): void {
    this.queue.push(passenger);
  }
}

export default Building;
