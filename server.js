const apiRouter           = require('./routes/api'),
      bodyParser          = require('body-parser'),
      connections         = require('./connections'),
      cors                = require('cors'),
      createError         = require('http-errors'),
      express             = require('express'),
      http                = require('http'),
      indexRouter         = require('./routes/index'),
      ottext              = require('ot-text'),
      path                = require('path'),
      ShareDB             = require('@teamwork/sharedb'),
      WebSocket           = require('ws'),
      WebSocketJSONStream = require('websocket-json-stream');

// Creating express server.
const app = express();
const server = http.createServer(app);
const socket = new WebSocket.Server({ server });

// Hooking up ShareDB backend to Redis and Mongo.
const backend = new ShareDB({
  db: connections.mongo,
  pubsub: connections.redis,
  disableSpaceDelimitedActions: true,
  disableDocAction: true,
});

// Register OT type.
ShareDB.types.register(ottext.type);

// View engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Routes
app.use('/', indexRouter);
app.use('/api', apiRouter);

// Middlewares
app.use(cors());
app.use(express.static('public'));
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 404
app.use((req, res, next) => {
  next(createError(404));
});

// Errors
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  /* render the error page */
  res.status(err.status || 500);
  res.render('error');
  next();
});

// Create a web server to serve raw transcript data
// and listen to WebSocket connections.
function startServer(port) {
  socket.on('connection', (websocket, req) => {
    if (process.env.NODE_ENV !== 'production') {
      websocket.on('message', data => {
        console.log(data);
      });
    }

    websocket.on('close', data => {
      console.log('disconnected', data);
    });

    const stream = new WebSocketJSONStream(websocket);
    backend.listen(stream);
  });

  server.listen(port, () => console.info('Server running on port: ' + port + ' 📡'));
}

// Attach backend to "app" to share with routes.
app.backend = backend;

module.exports = {
  startServer,
  app,
};
