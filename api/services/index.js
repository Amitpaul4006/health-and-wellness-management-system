const authService = require('./authService');
const medicationService = require('./medicationService');
const reportService = require('./reportService');

// Service logging wrapper
const wrapService = (service, name) => {
  return Object.keys(service).reduce((wrapped, key) => {
    wrapped[key] = async (...args) => {
      console.log(`${name}.${key} called`);
      try {
        return await service[key](...args);
      } catch (error) {
        console.error(`${name}.${key} error:`, error);
        throw error;
      }
    };
    return wrapped;
  }, {});
};

module.exports = {
  auth: wrapService(authService, 'auth'),
  medications: wrapService(medicationService, 'medications'),
  reports: wrapService(reportService, 'reports')
};
