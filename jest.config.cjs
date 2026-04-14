module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/*.test.js', '**/*.test.ts'],
  testPathIgnorePatterns:['/node_modules/', '/dist/'],
};
