const request = require('supertest');

const { createApp, getCity, getCities } = require('../graphserver');

describe('graphserver data helpers', () => {
  it('returns a city by name', () => {
    const city = getCity({ name: 'Chicago' });

    expect(city).toEqual(jasmine.objectContaining({
      city: 'Chicago',
      state: 'Illinois',
    }));
  });

  it('returns null when the city does not exist', () => {
    expect(getCity({ name: 'NotARealCity' })).toBeNull();
  });

  it('filters cities by state', () => {
    const cities = getCities({ state: 'CA' });

    expect(cities.length).toBeGreaterThan(0);
    expect(cities.every((city) => city.state === 'California')).toBeTrue();
  });

});

describe('graphserver HTTP endpoints', () => {
  const app = createApp();

  it('serves a health endpoint', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });

  it('serves a GraphQL query', async () => {
    const response = await request(app)
      .post('/graphql')
      .send({ query: '{ city(name: "Chicago") { city state } }' });

    expect(response.status).toBe(200);
    expect(response.body.data.city).toEqual({
      city: 'Chicago',
      state: 'Illinois',
    });
  });

  it('serves the root page', async () => {
    const response = await request(app).get('/');

    expect(response.status).toBe(200);
    expect(response.text).toContain('/graphql');
  });

  it('filters GraphQL cities by state alias', async () => {
    const response = await request(app)
      .post('/graphql')
      .send({ query: '{ cities(state: "CA") { city state } }' });

    expect(response.status).toBe(200);
    expect(response.body.data.cities.length).toBeGreaterThan(0);
    expect(response.body.data.cities.every((city) => city.state === 'California')).toBeTrue();
  });
});
