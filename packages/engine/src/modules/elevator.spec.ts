import Elevator, { ElevatorStatus } from './elevator';

describe('Elevator', () => {
  describe('sampleElevator()', () => {
    it('should generate a sample elevator', () => {
      const sampleElevator = Elevator.sampleElevator();
      expect(sampleElevator).not.toBeNull();
      expect(sampleElevator.capacity).toBeGreaterThan(0);
      expect(sampleElevator.speed).toBeGreaterThan(0);
      expect(sampleElevator.loadingDuration).toBeGreaterThan(0);
      expect(sampleElevator.floor).toEqual(0);
      expect(sampleElevator.status).toEqual(ElevatorStatus.NOT_IN_OPERATION);
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
      expect(elevator.speed).toEqual(2);
      expect(elevator.loadingDuration).toEqual(15);
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

    it('should change an elevator status only when it is NOT_IN_OPERATION', () => {
      elevator.startOperation();
      expect(elevator.status).toEqual(ElevatorStatus.IDLE);
    });

    it('should do nothing if elevator has other status than NOT_IN_OPERATION', () => {
      const statusToTest = [ElevatorStatus.DOWN, ElevatorStatus.UP, ElevatorStatus.LOADING, ElevatorStatus.STOPPING_OPERATION];
      statusToTest.forEach(status => {
        elevator.status = status;
        elevator.startOperation();
        expect(elevator.status).toEqual(status);
      });
    });
  });

  describe('stopOperation()', () => {
    let elevator: Elevator;

    beforeAll(() => {
      elevator = Elevator.sampleElevator();
      elevator.startOperation();
    });

    it('should stop an elevator only when it is not moving', () => {
      const statusToTest = [
        ElevatorStatus.LOADING,
        ElevatorStatus.STOPPING_OPERATION,
        ElevatorStatus.IDLE,
        ElevatorStatus.NOT_IN_OPERATION,
      ];
      statusToTest.forEach(status => {
        elevator.status = status;
        elevator.stopOperation();
        expect(elevator.status).toEqual(ElevatorStatus.NOT_IN_OPERATION);
      });
    });

    it('should set an elevator to interim status if it is moving', () => {
      const statusToTest = [ElevatorStatus.DOWN, ElevatorStatus.UP];
      statusToTest.forEach(status => {
        elevator.status = status;
        elevator.stopOperation();
        expect(elevator.status).toEqual(ElevatorStatus.STOPPING_OPERATION);
      });
    });
  });
});
