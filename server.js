// Compatibility entry point. All startup paths use the same MySQL backend.
// No legacy JSON database or independent in-memory sessions.
require('./server.mysql');

