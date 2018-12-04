process.env.NODE_ENV = 'test';

const app = require('../index');
const request = require('supertest')(app);
const { expect } = require('chai');
const connection = require('../db/connection');


describe('/api', () => {
  beforeEach(() => connection.migrate.rollback()
    .then(() => connection.migrate.latest())
    .then(() => connection.seed.run()));
  after(() => {
    connection.destroy();
  });

  describe('/topic', () => {
    it('GET - returns status 200 and all topics', () => request.get('/api/topics')
      .expect(200)
      .then(({ body }) => {
        expect(body.topics[0]).to.have.all.keys('slug', 'description');
        expect(body.topics).to.have.length(2);
        expect(body.topics[0].slug).to.equal('mitch');
      }));
    it('POST - returns status 201 and adds object to db', () => request.post('/api/topics').send({ slug: 'transpennine', description: 'A truely subpar rail experience' }).expect(201).then((res) => {
      expect(res.body).to.have.all.keys('slug', 'description');
      expect(res.body.slug).to.equal('transpennine');
    }));
    it('POST - returns status 400 if a badly formatted input is provided', () => request.post('/api/topics').send({ transpennine: 'is really good' }).expect(400));
    it('ALL - returns status 405 if user tries a non-get/post method', () => request.delete('/api/topics').expect(405));
  });
  describe('/api/topics/:topic/articles', () => {
    it('GET - returns an array of articles for a given topic', () => request.get('/api/topics/cats/articles').expect(200).then(({ body }) => {
      expect(body.articles).to.have.length(1);
      expect(body.articles[0]).to.have.all.keys('author', 'title', 'article_id', 'votes', 'comment_count', 'created_at', 'topic', 'body');
    }));
    it('GET/QUERIES - allows a query limit to be passed', () => request.get('/api/topics/mitch/articles?limit=5').expect(200).then(({ body }) => {
      expect(body.articles).to.have.length(5);
    }));
    it('GET/QUERIES - results can be sorted by any column, defulting to descending', () => request.get('/api/topics/mitch/articles?sort_by=article_id').expect(200).then(({ body }) => {
      expect(body.articles[0].article_id).to.equal(12);
      expect(body.articles[1].article_id).to.equal(11);
      expect(body.articles[2].article_id).to.equal(10);
    }));
    it('GET/QUERIES - results can ordered to sort ascending', () => request.get('/api/topics/mitch/articles?sort_by=article_id&sort_ascending=true').expect(200).then(({ body }) => {
      expect(body.articles[0].article_id).to.equal(1);
      expect(body.articles[1].article_id).to.equal(2);
      expect(body.articles[2].article_id).to.equal(3);
    }));
    it('GET/QUERIES - results can be offset with a page query', () => {
      request.get('/api/topics/mitch/articles?sort_by=article_id&page=2').expect(200).then(({ body }) => {
        expect(body.articles[0].article_id).to.equal(1);
      });
    });
    it('GET - returns 404 if given non existant topic', () => request.get('/api/topics/competenttraincompanies/articles').expect(404));
  });
});
