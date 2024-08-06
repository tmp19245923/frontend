import * as express from 'express';
import * as http from 'http';
import * as bodyParser from 'body-parser';
import * as session from 'express-session';

import { tickets, users } from './data';
import type { Tickets, Users } from './types';

declare module 'express-session' {
  interface SessionData {
    user: string | null;
  }
}

const app = express();
const publicRouter = express.Router();
const privateRouter = express.Router();

const httpPort = 3000;

const checkObj = (obj: object) => Object.keys(obj).length !== 0;

const isAuthenticated = (req, res, next) => {
  console.log(req.session.user);
  if (req.session.user === null || req.session.user === undefined) {
    res.status(401).json({
      error: 'Forbidden',
    });
    next();
  } else {
    res.status(200).json({
      error: 'ok',
    });
    next('route');
  }
};

app.all('/*', function (req, res, next) {
  res.set('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Headers', 'X-Requested-With');
  next();
});

app.use(bodyParser.json());

app.use(
  session({
    secret: 'mega-secret',
    resave: false,
    saveUninitialized: true,
    cookie: { httpOnly: true },
  })
);

app.use((req, _res, next) => {
  const { body, query, originalUrl } = req;
  const logData: {
    path: string;
    time: number;
    user?: string | null;
    body?: string;
    query?: typeof query;
  } = {
    path: originalUrl,
    time: Date.now(),
  };

  if (body) {
    logData.body = body;
  }

  if (checkObj(query)) {
    logData.query = query;
  }

  logData.user = req.session.user;

  console.log(JSON.stringify(logData, null, 2));

  next();
});

publicRouter.post('/login', (req, res, next) => {
  const { body } = req;

  if (body === undefined) {
    res.status(400).json({
      error: 'Params not found',
    });
    return next();
  }

  if (body.email === undefined) {
    res.status(400).json({
      error: 'Param email not found',
    });
    return next();
  }

  if (body.password === undefined) {
    res.status(400).json({
      error: 'Param password not found',
    });
    return next();
  }

  if (body.email === 'admin@example.com' && body.password === 'qwerty') {
    res.json({
      role: 'admin',
    });
  } else {
    res.status(401).json({
      error: 'Email or Password incorrect',
    });
  }

  req.session.regenerate((err) => {
    if (err) next(err);

    console.log('login');
    req.session.user = body.email;

    req.session.save((err) => {
      if (err) return next(err);
    });
  });

  res.status(500).json({
    error: 'Server error',
  });
});

privateRouter.post('/logout', (req, res, next) => {
  console.log('logout');

  req.session.user = null;
  req.session.save((err) => {
    if (err) next(err);

    req.session.regenerate((err) => {
      if (err) next(err);
    });
  });
});

privateRouter.get('/tickets', (req, res) => {
  const { query } = req;

  let items = tickets;
  let total = 0;

  if (query.filer !== undefined) {
    Object.entries(query.filer).map(([field, values]) => {
      if (values !== undefined && Array.isArray(values)) {
        items = items.filter((item) =>
          values.some((value) => String(item[field]) === value)
        );
      }
    });
  }

  total = items.length - 1;

  if (query.offset !== undefined) {
    items = items.slice(Number(query.offset), items.length);
  }

  if (query.limit !== undefined) {
    items = items.slice(0, Number(query.limit));
  }

  if (query.sort !== undefined) {
    if (query.vector !== undefined) {
      if (query.sort === 'userId' || query.sort === 'id') {
        const sort = String(query.sort);
        if (query.vector === 'acs') {
          items = items.sort((a, b) => a[sort] - b[sort]);
        } else {
          items = items.sort((a, b) => b[sort] - a[sort]);
        }
      }
    }
  }

  const result = {
    items,
    total,
  };

  res.json(result);
});

privateRouter.get('/tickets/count', (req, res) => {
  res.json({ total: tickets.length });
});

privateRouter.get('/dictionary/users', (_req, res) => {
  let items: { text: string; id: number }[] = [];

  const uniqueArray = (arr: Users) => {
    const a: Users = [];
    for (let i = 0, l = arr.length; i < l; i++)
      if (!a.some((v) => v.id === arr[i].id)) a.push(arr[i]);
    return a;
  };

  items = uniqueArray(users).map((v) => ({
    text: v.name,
    id: v.id,
  }));

  const result = {
    items,
  };

  res.json(result);
});

app.use('/api/', publicRouter);
app.use('/api/', isAuthenticated, privateRouter);

http.createServer(app).listen(httpPort, () => {
  console.log(`http://localhost:${httpPort}`);
});
