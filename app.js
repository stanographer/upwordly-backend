const cluster = require('cluster'),
      cpus = require('os').cpus().length,
      server = require('./server');

const PORT = process.env.PORT || 9090;

// Sets up master worker.
if (cluster.isMaster) {
  console.info(`Upwordly WebSocket master process ${process.pid} is running. ✅`);

  // Loops through number of CPUs and creates a worker process.
  for (let i = 0; i < cpus; i += 1) {
    cluster.fork();
  }

  // Fires event when a worker process dies.
  cluster.on('exit', (worker, code, signal) => {
    console.error(
      `Worker ${ worker.process.pid } died. ❌
       Code: ${ code }.
       Signal: ${ signal }
       Re-spawning...`
    );

    // If worker dies, re-spawn.
    cluster.fork();
  });
} else {
  console.log(`Worker process, ${ process.pid } online. 👷`);
  server.startServer(PORT);
}
