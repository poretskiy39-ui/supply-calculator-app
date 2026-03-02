import { calculateTotalCost } from './utils/calculations/full';

test('calculation module is available', () => {
  expect(typeof calculateTotalCost).toBe('function');
});
