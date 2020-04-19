import { randomInteger } from '@utils/random-integer';

class Passenger {
  public readonly originFloor: number;
  public readonly destinationFloor: number;

  constructor(originFloor: number, destinationFloor: number) {
    this.originFloor = originFloor;
    this.destinationFloor = destinationFloor;
  }

  public static randomPassenger(buildingFloors: number): Passenger {
    const originFloor = randomInteger(0, buildingFloors - 1);

    let destinationFloor = randomInteger(0, buildingFloors - 1);
    while (originFloor === destinationFloor) {
      destinationFloor = randomInteger(0, buildingFloors - 1);
    }

    return new Passenger(originFloor, destinationFloor);
  }
}

export default Passenger;
