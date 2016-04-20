import express from 'express';
import graphQLHTTP from 'express-graphql';
import renderOnServer from './renderOnServer'
import {schema} from './data/schema';

const APP_PORT = 8080;

var app = express();

// Expose a GraphQL endpoint
app.use('/graphql', graphQLHTTP({schema, pretty: true}));

// Serve JavaScript
app.get('/app.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.sendFile('app.js', {root: __dirname});
});

app.get('/app.js.map', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.sendFile('app.js.map', {root: __dirname});
});

// Serve HTML
app.get('/', (req, res, next) => {
  renderOnServer(res, next);
});

app.listen(APP_PORT, () => {
  console.log(`App is now running on http://localhost:${APP_PORT}`);
});
