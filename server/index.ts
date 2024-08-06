import * as express from 'express';
import * as session from 'express-session';
import * as path from 'path';

import { tickets, users } from './data';
import type { Tickets, Users } from './types';

const app = express();
const publicRouter = express.Router();
const privateRouter = express.Router();
const clientRouter = express.Router();

const port = 3000;

// process.env.DEBUG = 'express-session';

const checkObj = (obj: object) => Object.keys(obj).length !== 0;

const isAuthenticated = (req, res, next) => {
  console.log('user', req.session.user);
  if (req.session.user === null || req.session.user === undefined) {
    return res.status(401).json({
      error: 'Unauthorized',
    });
  } else {
    next('route');
  }
};

// function isAuthenticated(req, res, next) {
//   if (req.session.user) next();
//   else next('route');
// }

app.use(
  session({
    secret: 'megaSecret',
    resave: true,
    saveUninitialized: true,
  })
);

app.all('/*', (req, res, next) => {
  res.set('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Headers', 'X-Requested-With');
  next();
});

app.use(express.json());

app.use((req, _res, next) => {
  const { body, query, originalUrl } = req;
  const logData: {
    path: string;
    time: number;
    user?: { email: string } | null;
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

  logData.user = req.session.user || null;

  console.log(JSON.stringify(logData, null, 2));

  next();
});

clientRouter.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, './static/main.html'));
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
    req.session.user = { email: body.email };

    return res.json({
      role: 'admin',
    });
  } else {
    res.status(401).json({
      error: 'Email or Password incorrect',
    });
  }

  res.status(500).json({
    error: 'Server error',
  });
});

privateRouter.post('/logout', (req, res, next) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
      res.json({ error: 'Error destroying session' });
    } else {
      res.json({ ok: 'Session destroyed' });
    }
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

app.use('/', clientRouter);
app.use('/api', publicRouter);
app.use('/api', isAuthenticated, privateRouter);

app.listen(port, () => {
  console.log(`http://localhost:${port}`);
});
