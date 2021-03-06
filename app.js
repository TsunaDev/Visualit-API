/**
 * Script principal de l'application permettant de configurer les propriétés du site et d'appeler les différentes routes.
 */
require('appmetrics-dash').attach();
const createError = require('http-errors');
const express = require('express');
const expressFileUpload = require('express-fileupload');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const passport = require('passport');
const bodyParser = require('body-parser');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const axios = require('axios');
const fs = require('fs');

fs.readFile('VERSION', 'utf8', function(err, contents) {
  axios.get('http://x2021visualit2003257697000.northeurope.cloudapp.azure.com:3001/version?uuid=' + contents).then((res) => { process.env['API_VERSION'] = res.data });
});

const swaggerOptions = {
  swaggerDefinition: {
    info: {
      title: "Visualit API",
      description: "API permettant de gérer les différentes ressources de Visualit",
      servers: ["http://localhost:3000"]
    }
  },
  apis: ["./routes/*.js"]
}

const swaggerDocs = swaggerJsDoc(swaggerOptions);

swaggerDocs.security = [
  {
    Bearer: []
  }
];

swaggerDocs.securityDefinitions = {
  Bearer: {
    name: "Authorization",
    in: "header",
    type: "apiKey",
    description: "Please prefix your JWT with the word bearer (and a space)."
  }
};

require('dotenv').config();
require('./config/env');
require('./config/passport');

const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
const bedRouter = require('./routes/beds');
const serviceRouter = require('./routes/services');
const usersRouter = require('./routes/users');
const rolesRouter = require('./routes/roles');
const roomsRouter = require('./routes/rooms');
const etlRouter = require('./routes/etl');
const feedbackRouter = require('./routes/feedback');
const qrcodeRouter = require('./routes/qrcode');
const waitingRouter = require('./routes/waiting');
const statsRouter = require('./routes/stats');
const { cpuUsage } = require('process');

const app = express();

// Add CORS handling (any origin)

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  res.header("Access-Control-Allow-Methods", "*");
  next();
});

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(expressFileUpload());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());

app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/users', usersRouter);
app.use('/qr', qrcodeRouter);
app.use('/qrcodes', express.static('qrcodes'));
app.use('/roles', rolesRouter);
app.use('/import', etlRouter);
app.use('/beds', bedRouter);
app.use('/rooms', roomsRouter);
app.use('/services', serviceRouter);
app.use('/feedback', feedbackRouter);
app.use('/waiting', waitingRouter);
app.use('/stats', statsRouter);

app.get('/version', (req, res) => {
  res.status(200).send({version: process.env['API_VERSION']});
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
