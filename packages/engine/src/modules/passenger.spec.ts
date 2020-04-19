import Passenger from './passenger';
import { randomInteger } from '@utils/random-integer';

describe('Passenger', () => {
  describe('randomPassenger()', () => {
    it('should generate a Passenger instance', () => {
      const buildingFloors = randomInteger(0, 500);
      const passenger = Passenger.randomPassenger(buildingFloors);

      expect(passenger).not.toBeNull();

      expect(passenger.originFloor).toBeGreaterThanOrEqual(0);
      expect(passenger.originFloor).toBeLessThan(buildingFloors);

      expect(passenger.destinationFloor).toBeGreaterThanOrEqual(0);
      expect(passenger.destinationFloor).toBeLessThan(buildingFloors);

      expect(passenger.originFloor).not.toEqual(passenger.destinationFloor);
    });

    it('should ensure origin floor and destination floor are not same', () => {
      const passenger = Passenger.randomPassenger(2);

      expect(passenger.originFloor).not.toEqual(passenger.destinationFloor);
    });
  });

  it('should throw an error if building floors are less than 2', () => {
    expect(() => {
      Passenger.randomPassenger(1);
    }).toThrowError();
  });
});
