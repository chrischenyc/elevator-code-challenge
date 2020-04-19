import Building from './building';

describe('Building', () => {
  let building: Building;

  beforeAll(() => {
    building = new Building(20);
  });

  it('should be properly instantiated', () => {
    expect(building).not.toBeNull();
    expect(building.floors).toEqual(20);
    expect(building.elevators.length).toEqual(0);
    expect(building.queue.length).toEqual(0);
  });
});
