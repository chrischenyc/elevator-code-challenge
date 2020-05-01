import Building from './building';
import Elevator from '../elevator/elevator';

describe('Building', () => {
  let building: Building;
  const elevator = Elevator.sampleElevator();

  describe('constructor', () => {
    it('should be properly instantiated', () => {
      building = new Building(20);
      expect(building).not.toBeNull();
      expect(building.floors).toEqual(20);
      expect(building.elevators.length).toEqual(0);
      expect(building.queue.length).toEqual(0);
    });
  });

  describe('addElevator()', () => {
    beforeEach(() => {
      building = new Building(20);
    });

    it('should add a new elevator', () => {
      expect(() => {
        building.addElevator(elevator);
        expect(building.elevators.length).toEqual(1);
        expect(elevator.maxFloor).toEqual(building.floors - 1);
      }).not.toThrow();
    });

    it('should not add same elevator again', () => {
      expect(() => {
        building.addElevator(elevator);
        building.addElevator(elevator);
      }).toThrowError();
    });
  });

  describe('removeElevator()', () => {
    beforeEach(() => {
      building = new Building(20);
    });

    it('should remove an existing elevator', () => {
      expect(() => {
        building.addElevator(elevator);
        building.removeElevator(elevator);
        expect(building.elevators.length).toEqual(0);
      }).not.toThrow();
    });

    it('should not remove an elevator that has not been added', () => {
      expect(() => {
        building.removeElevator(elevator);
        building.removeElevator(elevator);
      }).toThrowError();
    });
  });
});
