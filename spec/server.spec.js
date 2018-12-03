
const supertest = require('supertest');
const { expect } = require('chai');
const app = require('../index');

const request = supertest(app); // eslint screwing with import order, hence this

describe('/api', () => {
  it('/topic', () => {
    it('GET - returns status 200 and all topics', () => request.get('/api/topics')
      .expect(200)
      .then((res) => {
        expect(5).to.equal(3);
      }));
  });
});
