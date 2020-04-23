import waitForExpect from 'wait-for-expect';

import Elevator, { ElevatorStatus, Direction } from '../modules/elevator/elevator';
import Passenger from '@modules/passenger/passenger';
import { logger } from '@utils/logger';

// describe('No passenger summons lift', () => {
//   let elevator: Elevator;

//   beforeAll(() => {
//     logger.info('------------------------------');
//     logger.info('No passenger summons lift');

//     elevator = Elevator.sampleElevator();
//     elevator.maxFloor = 10;
//     elevator.startOperation();
//   });

//   afterAll(() => {
//     elevator.stopOperation();
//   });

//   it('should stay idle', async () => {
//     await new Promise(r => setTimeout(r, 2000));

//     expect(elevator.status).toEqual(ElevatorStatus.IDLE);
//     expect(elevator.direction).toBeUndefined();
//     expect(elevator.floor).toEqual(0);
//   });
// });

// describe('Passenger summons lift on the ground floor. Once in, chooses to go to level 5', () => {
//   let elevator: Elevator;

//   beforeAll(() => {
//     logger.info('------------------------------');
//     logger.info('Passenger summons lift on the ground floor. Once in, chooses to go to level 5');

//     elevator = Elevator.sampleElevator();
//     elevator.maxFloor = 10;
//     elevator.startOperation();
//   });

//   afterAll(() => {
//     elevator.stopOperation();
//   });

//   it('should loading->0->1->2->3->4->5->unloading->idle', async () => {
//     // new passenger is waiting
//     const passenger = new Passenger(0, 5);
//     elevator.enqueue(passenger);

//     // loading
//     await waitForExpect(() => {
//       expect(elevator.status).toEqual(ElevatorStatus.LOADING);
//     });

//     // loaded and moving up
//     await waitForExpect(() => {
//       expect(elevator.passengers).toEqual([passenger]);
//       expect(elevator.queue).toEqual([]);
//       expect(elevator.status).toEqual(ElevatorStatus.MOVING);
//       expect(elevator.direction).toEqual(Direction.UP);
//     });
//     await waitForExpect(() => {
//       expect(elevator.floor).toEqual(1);
//     });
//     await waitForExpect(() => {
//       expect(elevator.floor).toEqual(2);
//     });
//     await waitForExpect(() => {
//       expect(elevator.floor).toEqual(3);
//     });
//     await waitForExpect(() => {
//       expect(elevator.floor).toEqual(4);
//     });

//     // unloading
//     await waitForExpect(() => {
//       expect(elevator.floor).toEqual(5);
//       expect(elevator.status).toEqual(ElevatorStatus.LOADING);
//     });

//     // unloaded and stay idle
//     await waitForExpect(() => {
//       expect(elevator.passengers).toEqual([]);
//       expect(elevator.queue).toEqual([]);

//       expect(elevator.floor).toEqual(5);
//       expect(elevator.status).toEqual(ElevatorStatus.IDLE);
//       expect(elevator.direction).toBeUndefined();
//     });
//   }, 3000000);
// });

// describe('Passenger summons lift on level 6 to go down. A passenger on level 4 summons the lift to go down. They both choose L1.', () => {
//   let elevator: Elevator;

//   beforeAll(() => {
//     logger.info('------------------------------');
//     logger.info('Passenger summons lift on level 6 to go down. A passenger on level 4 summons the lift to go down. They both choose L1.');

//     elevator = Elevator.sampleElevator();
//     elevator.maxFloor = 10;
//     elevator.startOperation();
//   });

//   afterAll(() => {
//     elevator.stopOperation();
//   });

//   it('should 0->1->2->3->4->5->6->loading->5->4->loading->3->2->1->unloading->idle', async () => {
//     // passengers are waiting
//     const passenger1 = new Passenger(6, 1);
//     const passenger2 = new Passenger(4, 1);
//     elevator.enqueue(passenger1);
//     elevator.enqueue(passenger2);

//     // moving up
//     await waitForExpect(() => {
//       expect(elevator.status).toEqual(ElevatorStatus.MOVING);
//       expect(elevator.direction).toEqual(Direction.UP);
//     });
//     await waitForExpect(() => {
//       expect(elevator.floor).toEqual(1);
//     });
//     await waitForExpect(() => {
//       expect(elevator.floor).toEqual(2);
//     });
//     await waitForExpect(() => {
//       expect(elevator.floor).toEqual(3);
//     });
//     await waitForExpect(() => {
//       expect(elevator.floor).toEqual(4);
//     });
//     await waitForExpect(() => {
//       expect(elevator.floor).toEqual(4);
//     });
//     await waitForExpect(() => {
//       expect(elevator.floor).toEqual(5);
//     });

//     // loading passenger 1
//     await waitForExpect(() => {
//       expect(elevator.floor).toEqual(6);
//       expect(elevator.status).toEqual(ElevatorStatus.LOADING);
//     });

//     // loaded and moving down
//     await waitForExpect(() => {
//       expect(elevator.passengers).toEqual([passenger1]);
//       expect(elevator.queue).toEqual([passenger2]);

//       expect(elevator.status).toEqual(ElevatorStatus.MOVING);
//       expect(elevator.direction).toEqual(Direction.DOWN);
//     });
//     await waitForExpect(() => {
//       expect(elevator.floor).toEqual(5);
//     });

//     // loading passenger 2
//     await waitForExpect(() => {
//       expect(elevator.floor).toEqual(4);
//       expect(elevator.status).toEqual(ElevatorStatus.LOADING);
//     });

//     // loaded and moving down
//     await waitForExpect(() => {
//       expect(elevator.passengers).toEqual([passenger1, passenger2]);
//       expect(elevator.queue).toEqual([]);

//       expect(elevator.status).toEqual(ElevatorStatus.MOVING);
//       expect(elevator.direction).toEqual(Direction.DOWN);
//     });
//     await waitForExpect(() => {
//       expect(elevator.floor).toEqual(3);
//     });
//     await waitForExpect(() => {
//       expect(elevator.floor).toEqual(2);
//     });

//     // unloading
//     await waitForExpect(() => {
//       expect(elevator.floor).toEqual(1);
//       expect(elevator.status).toEqual(ElevatorStatus.LOADING);
//     });

//     // unloaded and stay idle
//     await waitForExpect(() => {
//       expect(elevator.passengers).toEqual([]);
//       expect(elevator.queue).toEqual([]);

//       expect(elevator.floor).toEqual(1);
//       expect(elevator.status).toEqual(ElevatorStatus.IDLE);
//       expect(elevator.direction).toBeUndefined();
//     });
//   }, 3000000);
// });

// describe('Passenger 1 summons lift to go up from L2. Passenger 2 summons lift to go down from L4. Passenger 1 chooses to go to L6. Passenger 2 chooses to go to Ground Floor', () => {
//   let elevator: Elevator;

//   beforeAll(() => {
//     logger.info('------------------------------');
//     logger.info(
//       'Passenger 1 summons lift to go up from L2. Passenger 2 summons lift to go down from L4. Passenger 1 chooses to go to L6. Passenger 2 chooses to go to Ground Floor',
//     );

//     elevator = Elevator.sampleElevator();
//     elevator.maxFloor = 10;
//     elevator.startOperation();
//   });

//   afterAll(() => {
//     elevator.stopOperation();
//   });

//   it('should 0->1->2->loading->3->4->5->6->unloading->5->4->loading->3->2->1->0->unloading->idle', async () => {
//     // passengers are waiting
//     const passenger1 = new Passenger(2, 6);
//     const passenger2 = new Passenger(4, 0);
//     elevator.enqueue(passenger1);
//     elevator.enqueue(passenger2);

//     // moving up
//     await waitForExpect(() => {
//       expect(elevator.status).toEqual(ElevatorStatus.MOVING);
//       expect(elevator.direction).toEqual(Direction.UP);
//     });
//     await waitForExpect(() => {
//       expect(elevator.floor).toEqual(1);
//     });

//     // loading passenger 1
//     await waitForExpect(() => {
//       expect(elevator.floor).toEqual(2);
//       expect(elevator.status).toEqual(ElevatorStatus.LOADING);
//     });

//     // loaded and moving up
//     await waitForExpect(() => {
//       expect(elevator.passengers).toEqual([passenger1]);
//       expect(elevator.queue).toEqual([passenger2]);

//       expect(elevator.status).toEqual(ElevatorStatus.MOVING);
//       expect(elevator.direction).toEqual(Direction.UP);
//     });
//     await waitForExpect(() => {
//       expect(elevator.floor).toEqual(3);
//     });
//     await waitForExpect(() => {
//       expect(elevator.floor).toEqual(4);
//     });
//     await waitForExpect(() => {
//       expect(elevator.floor).toEqual(5);
//     });

//     // unloading on floor 6
//     await waitForExpect(() => {
//       expect(elevator.floor).toEqual(6);
//       expect(elevator.status).toEqual(ElevatorStatus.LOADING);
//     });

//     // unloaded and moving down
//     await waitForExpect(() => {
//       expect(elevator.passengers).toEqual([]);
//       expect(elevator.queue).toEqual([passenger2]);

//       expect(elevator.status).toEqual(ElevatorStatus.MOVING);
//       expect(elevator.direction).toEqual(Direction.DOWN);
//     });
//     await waitForExpect(() => {
//       expect(elevator.floor).toEqual(5);
//     });

//     // loading on floor 4
//     await waitForExpect(() => {
//       expect(elevator.floor).toEqual(4);
//       expect(elevator.status).toEqual(ElevatorStatus.LOADING);
//     });

//     // loaded and moving down
//     await waitForExpect(() => {
//       expect(elevator.passengers).toEqual([passenger2]);
//       expect(elevator.queue).toEqual([]);

//       expect(elevator.status).toEqual(ElevatorStatus.MOVING);
//       expect(elevator.direction).toEqual(Direction.DOWN);
//     });

//     await waitForExpect(() => {
//       expect(elevator.floor).toEqual(3);
//     });
//     await waitForExpect(() => {
//       expect(elevator.floor).toEqual(2);
//     });
//     await waitForExpect(() => {
//       expect(elevator.floor).toEqual(1);
//     });

//     // unloading
//     await waitForExpect(() => {
//       expect(elevator.floor).toEqual(0);
//       expect(elevator.status).toEqual(ElevatorStatus.LOADING);
//     });

//     // unloaded and stay idle
//     await waitForExpect(() => {
//       expect(elevator.passengers).toEqual([]);
//       expect(elevator.queue).toEqual([]);

//       expect(elevator.floor).toEqual(0);
//       expect(elevator.status).toEqual(ElevatorStatus.IDLE);
//       expect(elevator.direction).toBeUndefined();
//     });
//   }, 300000);
// });

describe('Passenger 1 summons lift to go up from Ground. Then choose L5. Passenger 2 summons lift to go down from L4. Passenger 3 summons lift to go down from L10. Passengers 2 and 3 choose to travel to Ground.', () => {
  let elevator: Elevator;

  beforeAll(() => {
    elevator = Elevator.sampleElevator();
    elevator.maxFloor = 10;
    logger.info('------------------------------');
    elevator.startOperation();
  });

  afterAll(() => {
    elevator.stopOperation();
  });

  it('should 0->loading->1->2->3->4->5->unloading->4->3->2->1->0->unloading->1->2->3->4->5->6->7->8->9->10->loading->9->8->7->6->5->4->3->2->1->0->unloading->idle', async () => {
    logger.info(
      'Passenger 1 summons lift to go up from Ground. Then choose L5. Passenger 2 summons lift to go down from L4. Passenger 3 summons lift to go down from L10. Passengers 2 and 3 choose to travel to Ground.',
    );

    // passengers are waiting
    const passenger1 = new Passenger(0, 5);
    const passenger2 = new Passenger(4, 0);
    const passenger3 = new Passenger(10, 0);
    elevator.enqueue(passenger1);
    elevator.enqueue(passenger2);
    elevator.enqueue(passenger3);

    // loading passenger 1
    await waitForExpect(() => {
      expect(elevator.floor).toEqual(0);
      expect(elevator.status).toEqual(ElevatorStatus.LOADING);
    });

    // loaded and moving up
    await waitForExpect(() => {
      expect(elevator.passengers).toEqual([passenger1]);
      expect(elevator.queue).toEqual([passenger2, passenger3]);

      expect(elevator.status).toEqual(ElevatorStatus.MOVING);
      expect(elevator.direction).toEqual(Direction.UP);
    });
    await waitForExpect(() => {
      expect(elevator.floor).toEqual(1);
    });
    await waitForExpect(() => {
      expect(elevator.floor).toEqual(2);
    });
    await waitForExpect(() => {
      expect(elevator.floor).toEqual(3);
    });
    await waitForExpect(() => {
      expect(elevator.floor).toEqual(4);
    });

    // unloading on floor 5
    await waitForExpect(() => {
      expect(elevator.floor).toEqual(5);
      expect(elevator.status).toEqual(ElevatorStatus.LOADING);
    });

    // unloaded and moving down
    await waitForExpect(() => {
      expect(elevator.passengers).toEqual([]);
      expect(elevator.queue).toEqual([passenger2, passenger3]);

      expect(elevator.status).toEqual(ElevatorStatus.MOVING);
      expect(elevator.direction).toEqual(Direction.DOWN);
    });

    // loading on floor 4
    await waitForExpect(() => {
      expect(elevator.floor).toEqual(4);
      expect(elevator.status).toEqual(ElevatorStatus.LOADING);
    });

    // loaded and moving down
    await waitForExpect(() => {
      expect(elevator.passengers).toEqual([passenger2]);
      expect(elevator.queue).toEqual([passenger3]);

      expect(elevator.status).toEqual(ElevatorStatus.MOVING);
      expect(elevator.direction).toEqual(Direction.DOWN);
    });

    await waitForExpect(() => {
      expect(elevator.floor).toEqual(3);
    });
    await waitForExpect(() => {
      expect(elevator.floor).toEqual(2);
    });
    await waitForExpect(() => {
      expect(elevator.floor).toEqual(1);
    });

    // unloading on floor 0
    await waitForExpect(() => {
      expect(elevator.floor).toEqual(0);
      expect(elevator.status).toEqual(ElevatorStatus.LOADING);
    });

    // unloaded and moving up
    await waitForExpect(() => {
      expect(elevator.passengers).toEqual([]);
      expect(elevator.queue).toEqual([passenger3]);

      expect(elevator.status).toEqual(ElevatorStatus.MOVING);
      expect(elevator.direction).toEqual(Direction.UP);
    });

    await waitForExpect(() => {
      expect(elevator.floor).toEqual(1);
    });
    await waitForExpect(() => {
      expect(elevator.floor).toEqual(2);
    });
    await waitForExpect(() => {
      expect(elevator.floor).toEqual(3);
    });
    await waitForExpect(() => {
      expect(elevator.floor).toEqual(4);
    });
    await waitForExpect(() => {
      expect(elevator.floor).toEqual(5);
    });
    await waitForExpect(() => {
      expect(elevator.floor).toEqual(6);
    });
    await waitForExpect(() => {
      expect(elevator.floor).toEqual(7);
    });
    await waitForExpect(() => {
      expect(elevator.floor).toEqual(8);
    });
    await waitForExpect(() => {
      expect(elevator.floor).toEqual(9);
    });

    // loading on floor 10
    await waitForExpect(() => {
      expect(elevator.floor).toEqual(10);
      expect(elevator.status).toEqual(ElevatorStatus.LOADING);
    });

    // loaded and moving down
    await waitForExpect(() => {
      expect(elevator.passengers).toEqual([passenger3]);
      expect(elevator.queue).toEqual([]);

      expect(elevator.status).toEqual(ElevatorStatus.MOVING);
      expect(elevator.direction).toEqual(Direction.DOWN);
    });
    await waitForExpect(() => {
      expect(elevator.floor).toEqual(9);
    });
    await waitForExpect(() => {
      expect(elevator.floor).toEqual(8);
    });
    await waitForExpect(() => {
      expect(elevator.floor).toEqual(7);
    });
    await waitForExpect(() => {
      expect(elevator.floor).toEqual(6);
    });
    await waitForExpect(() => {
      expect(elevator.floor).toEqual(5);
    });
    await waitForExpect(() => {
      expect(elevator.floor).toEqual(4);
    });
    await waitForExpect(() => {
      expect(elevator.floor).toEqual(3);
    });
    await waitForExpect(() => {
      expect(elevator.floor).toEqual(2);
    });
    await waitForExpect(() => {
      expect(elevator.floor).toEqual(1);
    });

    // unloading on floor 0
    await waitForExpect(() => {
      expect(elevator.floor).toEqual(0);
      expect(elevator.status).toEqual(ElevatorStatus.LOADING);
    });

    // unloaded and stay idle
    await waitForExpect(() => {
      expect(elevator.passengers).toEqual([]);
      expect(elevator.queue).toEqual([]);

      expect(elevator.floor).toEqual(0);
      expect(elevator.status).toEqual(ElevatorStatus.IDLE);
      expect(elevator.direction).toBeUndefined();
    });
  }, 300000);
});
