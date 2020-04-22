import Elevator, { ElevatorStatus, ElevatorDirection } from './elevator';
import Passenger from '@modules/passenger/passenger';

describe('Elevator', () => {
  describe('sampleElevator()', () => {
    it('should generate a sample elevator', () => {
      const sampleElevator = Elevator.sampleElevator();
      expect(sampleElevator).not.toBeNull();
      expect(sampleElevator.capacity).toBeGreaterThan(0);
      expect(sampleElevator.floorSpeed).toBeGreaterThan(0);
      expect(sampleElevator.loadingSpeed).toBeGreaterThan(0);
      expect(sampleElevator.floor).toEqual(0);
      expect(sampleElevator.status).toEqual(ElevatorStatus.NOT_IN_SERVICE);
      expect(sampleElevator.passengers.length).toEqual(0);
      expect(sampleElevator.queue.length).toEqual(0);
    });

    it('should generate multiple sample elevators with unique ids', () => {
      const sampleElevator = Elevator.sampleElevator();
      const anotherSampleElevator = Elevator.sampleElevator();
      expect(sampleElevator.id).not.toEqual(anotherSampleElevator.id);
    });
  });

  describe('constructor', () => {
    it('should instantiate an elevator instance with given specs', () => {
      const elevator = new Elevator(15, 2, 15);
      expect(elevator.capacity).toEqual(15);
      expect(elevator.floorSpeed).toEqual(2);
      expect(elevator.loadingSpeed).toEqual(15);
    });

    it('should instantiate multiple elevator instances with unique ids', () => {
      const elevator1 = new Elevator(20, 3, 12);
      const elevator2 = new Elevator(20, 3, 12);
      expect(elevator1.id).not.toEqual(elevator2.id);
    });
  });

  describe('startOperation()', () => {
    let elevator: Elevator;

    beforeAll(() => {
      elevator = Elevator.sampleElevator();
    });

    afterEach(() => {
      elevator.stopOperation();
    });

    it('should change an elevator status only when it is STOPPED', () => {
      elevator.startOperation();
      expect(elevator.status).toEqual(ElevatorStatus.IDLE);
    });

    it('should do nothing if elevator has other status than STOPPED', () => {
      const statusToTest = [ElevatorStatus.MOVING, ElevatorStatus.LOADING, ElevatorStatus.IDLE];
      statusToTest.forEach(status => {
        elevator.status = status;
        elevator.startOperation();
        expect(elevator.status).toEqual(status);
      });
    });
  });

  describe('stopOperation()', () => {
    let elevator: Elevator;

    beforeEach(() => {
      elevator = Elevator.sampleElevator();
      elevator.startOperation();
    });

    afterEach(() => {
      elevator.stopOperation();
    });

    it('should stop an elevator immediately', () => {
      const statusToTest = [ElevatorStatus.NOT_IN_SERVICE, ElevatorStatus.IDLE, ElevatorStatus.MOVING, ElevatorStatus.LOADING];
      statusToTest.forEach(status => {
        elevator.status = status;
        elevator.stopOperation();
        expect(elevator.status).toEqual(ElevatorStatus.NOT_IN_SERVICE);
      });
    });
  });

  describe('elevatorToEnqueue()', () => {
    const floors = 10;
    const elevator1 = Elevator.sampleElevator();
    const elevator2 = Elevator.sampleElevator();
    const elevator3 = Elevator.sampleElevator();
    const elevator4 = Elevator.sampleElevator();
    const elevators = [elevator1, elevator2, elevator3, elevator4];

    beforeEach(() => {
      elevators.forEach(elevator => {
        elevator.maxFloor = floors;
        elevator.startOperation();
      });
    });

    afterEach(() => {
      elevators.forEach(elevator => elevator.stopOperation());
    });

    it('should pick the idle elevator closest to passenger', () => {
      const passenger = new Passenger(5, 10);
      elevator1.status = ElevatorStatus.IDLE;
      elevator1.floor = 4;

      elevator2.status = ElevatorStatus.IDLE;
      elevator2.floor = 2;

      elevator3.status = ElevatorStatus.IDLE;
      elevator3.floor = 3;

      elevator4.status = ElevatorStatus.IDLE;
      elevator4.floor = 7;

      const elevator = Elevator.elevatorToEnqueue(elevators, passenger);
      expect(elevator).toEqual(elevator1);
    });

    it('should pick the suitable moving elevator at the moment', () => {
      const passenger = new Passenger(5, 10);
      elevator1.status = ElevatorStatus.NOT_IN_SERVICE;
      elevator1.floor = 4;

      elevator2.status = ElevatorStatus.MOVING;
      elevator2.direction = ElevatorDirection.UP;
      elevator2.floor = 2;
      elevator2.passengers = [
        Passenger.samplePassenger(floors),
        Passenger.samplePassenger(floors),
        Passenger.samplePassenger(floors),
        Passenger.samplePassenger(floors),
        Passenger.samplePassenger(floors),
        Passenger.samplePassenger(floors),
        Passenger.samplePassenger(floors),
        Passenger.samplePassenger(floors),
        Passenger.samplePassenger(floors),
        Passenger.samplePassenger(floors),
      ];

      elevator3.status = ElevatorStatus.MOVING;
      elevator3.direction = ElevatorDirection.UP;
      elevator3.floor = 3;
      elevator3.passengers = [Passenger.samplePassenger(floors), Passenger.samplePassenger(floors)];

      elevator4.status = ElevatorStatus.MOVING;
      elevator4.direction = ElevatorDirection.DOWN;
      elevator4.floor = 7;
      elevator4.passengers = [Passenger.samplePassenger(floors), Passenger.samplePassenger(floors)];

      const elevator = Elevator.elevatorToEnqueue(elevators, passenger);
      expect(elevator).toEqual(elevator3);
    });

    it('should return null if no suitable elevator at the moment', () => {
      const passenger = new Passenger(5, 10);
      elevator1.status = ElevatorStatus.NOT_IN_SERVICE;
      elevator1.floor = 4;

      elevator2.status = ElevatorStatus.MOVING;
      elevator2.direction = ElevatorDirection.UP;
      elevator2.floor = 2;
      elevator2.passengers = [
        Passenger.samplePassenger(floors),
        Passenger.samplePassenger(floors),
        Passenger.samplePassenger(floors),
        Passenger.samplePassenger(floors),
        Passenger.samplePassenger(floors),
        Passenger.samplePassenger(floors),
        Passenger.samplePassenger(floors),
        Passenger.samplePassenger(floors),
        Passenger.samplePassenger(floors),
        Passenger.samplePassenger(floors),
      ];

      elevator3.status = ElevatorStatus.MOVING;
      elevator3.direction = ElevatorDirection.DOWN;
      elevator3.floor = 3;
      elevator3.passengers = [Passenger.samplePassenger(floors), Passenger.samplePassenger(floors)];

      elevator4.status = ElevatorStatus.MOVING;
      elevator4.direction = ElevatorDirection.DOWN;
      elevator4.floor = 7;
      elevator4.passengers = [Passenger.samplePassenger(floors), Passenger.samplePassenger(floors)];

      const elevator = Elevator.elevatorToEnqueue(elevators, passenger);
      expect(elevator).toBeNull();
    });
  });
});
