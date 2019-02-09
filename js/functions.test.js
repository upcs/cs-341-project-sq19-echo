const sum = require('./functions');

test('adds 2 + 3 to equal 5', () => {
  expect(sum(2, 3)).toBe(5);
});

test('adds 6 + -2 to equal 4', () => {
  expect(sum(6, -2)).toBe(4);
});