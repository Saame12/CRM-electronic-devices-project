// One default dataset for clean installations, independent of the database name.
const { seedDemo } = require('./seed-demo');
const { DATASET, buildDemo } = require('../database/demo-data-v3');
const seedCurrentDemo = (connection, options = {}) =>
  seedDemo(connection, { ...options, build: buildDemo, dataset: DATASET });
module.exports = { seedCurrentDemo, DATASET };
