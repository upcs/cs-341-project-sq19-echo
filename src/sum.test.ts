import { sum } from './sum';

test('No Inputs', () => {
  expect(sum()).toBe(0);
});

test('1 + 2', () => {
  expect(sum(1, 2)).toBe(3);
});