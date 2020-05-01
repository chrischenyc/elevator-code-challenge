import { randomInteger } from './random-integer';

describe('randomInteger', () => {
  it('should generate a random integer between 0 and 100', () => {
    const result = randomInteger(0, 100);
    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThanOrEqual(100);
  });

  it('should generate a random integer between -100 and 0', () => {
    const result = randomInteger(0, -100);
    expect(result).toBeLessThanOrEqual(0);
    expect(result).toBeGreaterThanOrEqual(-100);
  });
});
