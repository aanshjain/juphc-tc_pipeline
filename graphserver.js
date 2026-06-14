const express = require('express');
const helmet = require('helmet');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const fs = require('fs');
const path = require('path');

const { URLSearchParams } = require('url');
global.URLSearchParams = URLSearchParams;

const dataPath = path.join(__dirname, 'UScities.json');
const rawdata = fs.readFileSync(dataPath, 'utf8');
const usCities = JSON.parse(rawdata);

const schema = buildSchema(`
  type Query {
    city(name: String!): City
    cities(state: String): [City!]!
  }

  type City {
    city: String
    state: String
  }
`);

const stateAliases = {
  AL: 'ALABAMA',
  AK: 'ALASKA',
  AZ: 'ARIZONA',
  AR: 'ARKANSAS',
  CA: 'CALIFORNIA',
  CO: 'COLORADO',
  CT: 'CONNECTICUT',
  DE: 'DELAWARE',
  FL: 'FLORIDA',
  GA: 'GEORGIA',
  HI: 'HAWAII',
  ID: 'IDAHO',
  IL: 'ILLINOIS',
  IN: 'INDIANA',
  IA: 'IOWA',
  KS: 'KANSAS',
  KY: 'KENTUCKY',
  LA: 'LOUISIANA',
  ME: 'MAINE',
  MD: 'MARYLAND',
  MA: 'MASSACHUSETTS',
  MI: 'MICHIGAN',
  MN: 'MINNESOTA',
  MS: 'MISSISSIPPI',
  MO: 'MISSOURI',
  MT: 'MONTANA',
  NE: 'NEBRASKA',
  NV: 'NEVADA',
  NH: 'NEW HAMPSHIRE',
  NJ: 'NEW JERSEY',
  NM: 'NEW MEXICO',
  NY: 'NEW YORK',
  NC: 'NORTH CAROLINA',
  ND: 'NORTH DAKOTA',
  OH: 'OHIO',
  OK: 'OKLAHOMA',
  OR: 'OREGON',
  PA: 'PENNSYLVANIA',
  RI: 'RHODE ISLAND',
  SC: 'SOUTH CAROLINA',
  SD: 'SOUTH DAKOTA',
  TN: 'TENNESSEE',
  TX: 'TEXAS',
  UT: 'UTAH',
  VT: 'VERMONT',
  VA: 'VIRGINIA',
  WA: 'WASHINGTON',
  WV: 'WEST VIRGINIA',
  WI: 'WISCONSIN',
  WY: 'WYOMING',
};

function getCity(args = {}) {
  const name = (args.name || '').trim().toLowerCase();
  return usCities.find((city) => city.city.toLowerCase() === name) || null;
}

function getCities(args = {}) {
  if (!args.state) {
    return usCities;
  }

  const requestedState = args.state.trim().toUpperCase();
  const state = stateAliases[requestedState] || requestedState;
  return usCities.filter((city) => city.state.toUpperCase() === state);
}

const root = {
  city: getCity,
  cities: getCities,
};

function createApp() {
  const app = express();

  app.use(helmet());

  app.get('/', (_req, res) => {
    res.send('Open /graphql to explore the Tax Calculator city lookup API.');
  });

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use(
    '/graphql',
    graphqlHTTP({
      schema,
      rootValue: root,
      graphiql: true,
    })
  );

  return app;
}

if (require.main === module) {
  const port = process.env.PORT || 4000;
  createApp().listen(port, () => {
    console.log(`Express GraphQL Server now running on port ${port}/graphql`);
  });
}

module.exports = {
  createApp,
  getCity,
  getCities,
  root,
  schema,
};
