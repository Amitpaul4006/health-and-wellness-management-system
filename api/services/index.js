const authService = require('./authService');
const medicationService = require('./medicationService');
const reportService = require('./reportService');
const emailService = require('./emailService');

// Service layer logging
const wrapService = (service) => {
  return Object.keys(service).reduce((wrapped, key) => {
    wrapped[key] = async (...args) => {
      console.log(`Calling ${key} in ${process.env.NODE_ENV}`);
      try {
        return await service[key](...args);
      } catch (error) {
        console.error(`Error in ${key}:`, error);
        throw error;
      }
    };
    return wrapped;
  }, {});
};

module.exports = {
  authService: wrapService(authService),
  medicationService: wrapService(medicationService),
  reportService: wrapService(reportService),
  emailService: wrapService(emailService)
};
