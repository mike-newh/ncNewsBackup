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
      console.log(body.articles);
      expect(body.articles).to.have.length(1);
      expect(body.articles[0]).to.have.all.keys('author', 'title', 'article_id', 'votes', 'comment_count', 'created_at', 'topic', 'body');
    }));
  });
});
