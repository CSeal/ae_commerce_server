import { Application } from "express";
import * as express from "express";
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import * as bodyParser from 'body-parser';
import * as compression from 'compression';
import * as helmet from 'helmet';
import * as apicache from 'apicache';


// let process: any;
// let server: any
process.on('uncaughtException', err => {
  // let stack = err.stack;
  console.log(`Uncaught exception. ${err}`);
});

const app: Application = express();

app.use(helmet());
app.use(compression());
// app.use(morgan('combined', {
//   skip: function (req, res) { return res.statusCode < 400 }
// }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// app.use(cookieParser());

// setting up application/json type
app.use(function (req, res, next) {
  res.contentType('application/json');
  next();
});

// cache all reposnes
// app.use(apicache.middleware('25 minutes'))

// getting aeClients work!
import Prodbaza from './controllers/prodbaza';
new Prodbaza(app);
import ApiBjjdepot from './controllers/bjjdepot';
new ApiBjjdepot(app);
import ApiHandstich from './controllers/handstich';
new ApiHandstich(app);

app.listen(
  5055,
  () : void => {
    console.log(`Server is listening on port 5055!`);
  }
);

