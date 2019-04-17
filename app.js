const cluster  = require('cluster'),
      cpus     = require('os').cpus().length,
      server   = require('./server'),
      Users    = require('./users');

const PORT = process.env.PORT || 9090;

// Sets up master worker.
if (cluster.isMaster) {
  console.info(`Master process (id: ${ process.pid }) is running. ✅
  Forking ${ cpus } workers.`);

  // Loops through number of cores and creates a worker process.
  const workers = [...Array(cpus)].map(() => cluster.fork());

  // Process is clustered on a core and process id is assigned.
  cluster.on('online', worker => {
    console.info(`Worker process (id: ${ worker.process.pid } online and listening. 👷`);
  });

  const notifyWs = data => {
    process.send({
      type: 'UPDATE_USERS',
      payload: data,
    });
  };

  workers.forEach(worker => {
    worker.on('message', message => {
      switch (message.type) {
        case 'LOG_ON':
          Users.addUser(message.payload, notifyWs);
          break;
        case 'LOG_OFF':
          Users.removeUser(message.payload);
          break;
        case 'LIST_USERS':
          return Users.getList();
        case 'USER_COUNT':
          return Users.userCount();
        default:
          break;
      }
    });
  });

  // Fires event when a worker process dies.
  cluster.on('exit', (worker, code, signal) => {

    // If worker dies, re-spawn.
    console.error(
      `Worker ${ worker.process.pid } died. ❌
       Code: ${ code }.
       Signal: ${ signal }
       Re-spawning...`,
    );
    cluster.fork();
  });
} else {

  // Fork a process, start a server.
  server.startServer(PORT);
}
