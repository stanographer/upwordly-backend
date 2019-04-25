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

// Hooking up ShareDB backend to Redis and Mongo.
const backend = new ShareDB({
  db: connections.mongo(),
  pubsub: connections.redis(),
  disableSpaceDelimitedActions: true,
  disableDocAction: true,
});

// Register OT type.
ShareDB.types.register(ottext.type);

// View engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Middlewares
app.use(cors());
app.use(express.static('public'));
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/', indexRouter);
app.use('/api', apiRouter);

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
  const server = http.createServer(app);
  const socket = new WebSocket.Server({ server });

  socket.on('connection', (websocket, req) => {
    let job = {};

    websocket.on('message', data => {
      const action = JSON.parse(data);

      switch (action.type) {
        // Record the user logged on.
        case 'LOG_ON':
          job = action.payload;

          process.send({
            type: 'LOG_ON',
            payload: action.payload,
          });
          break;
        // List out logged-on users.
        case 'LIST_USERS':
          process.send({
            type: 'LIST_USERS',
            payload: '',
          });
          break;
        // Returns current user count.
        case 'USER_COUNT':
          process.send({
            type: 'USER_COUNT',
            payload: '',
          });
          break;
        default:
          break;
      }
    });

    websocket.on('close', () => {

      // Remove user from list.
      process.send({
        type: 'LOG_OFF',
        payload: job,
      });
    });

    const stream = new WebSocketJSONStream(websocket);
    backend.listen(stream);
  });

  server.listen(port, () => console.info('Server running on port: ' + port + ' 📡'));
}

// Attach backend to "app" to share with routes.
app.backend = backend;

module.exports = {
  app,
  startServer,
};
