const jobScheduler = require('../services/jobScheduler');

beforeAll(async () => {
  // Increase timeout for tests
  jest.setTimeout(10000);
});

afterAll(async () => {
  // Ensure all job queues are cleaned up
  await jobScheduler.jobCleanup();
  // Wait for connections to close
  await new Promise(resolve => setTimeout(resolve, 500));
});

// Add a dummy test to satisfy Jest
test('setup is working', () => {
  expect(true).toBe(true);
});
