try {
  require('./demo-env').loadDemoEnv();
  require('../server.mysql');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
