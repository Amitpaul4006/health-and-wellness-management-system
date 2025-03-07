const { Parser } = require('json2csv');

const generateCSV = (medications) => {
  const fields = ['name', 'description', 'type', 'scheduledDate', 'time', 'status'];
  const opts = { fields };
  const parser = new Parser(opts);
  return parser.parse(medications);
};

module.exports = {
  generateCSV
};
