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
      expect(res.body.topic).to.have.all.keys('slug', 'description');
      expect(res.body.topic.slug).to.equal('transpennine');
    }));
    it('POST - returns status 400 if given slug as int', () => request.post('/api/topics').send({ slug: '4664', description: 'A truely subpar rail experience' }).expect(400));
    it('POST - returns status 400 if a badly formatted input is provided', () => request.post('/api/topics').send({ transpennine: 'is really good' }).expect(400));
    it('POST - returns status 422 if topic already exists', () => request.post('/api/topics').send({ slug: 'mitch', description: 'aaaa' }).expect(422));
    it('OTHER - returns status 405 if user tries a non-get/post method', () => request.delete('/api/topics').expect(405));
  });
  describe('/api/topics/:topic/articles', () => {
    it('GET - returns an array of articles for a given topic', () => request.get('/api/topics/cats/articles').expect(200).then(({ body }) => {
      expect(body.articles).to.have.length(1);
      expect(body.articles[0]).to.have.all.keys('author', 'title', 'article_id', 'votes', 'comment_count', 'created_at', 'topic');
    }));
    it('GET/QUERIES - allows a query limit to be passed', () => request.get('/api/topics/mitch/articles?limit=5').expect(200).then(({ body }) => {
      expect(body.articles).to.have.length(5);
    }));
    it('GET/QUERIES - if limit query is non-number, returns 400', () => request.get('/api/topics/mitch/articles?limit=cats').expect(400));
    it('GET/QUERIES - if limit query is float, returns 400', () => request.get('/api/topics/mitch/articles?limit=6.2').expect(400));
    it('GET/QUERIES - results can be sorted by any column, defulting to created_at (date)', () => request.get('/api/topics/mitch/articles?sort_by=article_id').expect(200).then(({ body }) => {
      expect(body.articles[0].article_id).to.equal(12);
      expect(body.articles[1].article_id).to.equal(11);
      expect(body.articles[2].article_id).to.equal(10);
    }));
    it('GET/QUERIES - a bad input on sort_ascending will default to false', () => request.get('/api/topics/mitch/articles?sort_by=article_id&sort_ascending=donald').expect(200).then(({ body }) => {
      expect(body.articles[0].article_id).to.equal(12);
      expect(body.articles[1].article_id).to.equal(11);
      expect(body.articles[2].article_id).to.equal(10);
    }));
    it('GET/QUERIES - a bad sort column will return 200 and default sort column if syntax is correct', () => request.get('/api/topics/mitch/articles?sort_by=transpennine').expect(200).then(({ body }) => {
      expect(body.articles[0].article_id).to.equal(1);
    }));
    it('GET/QUERIES - a bad sort column will return 400 if the syntax is bad', () => request.get('/api/topics/mitch/articles?sort_by=5835').expect(400));
    it('GET/QUERIES - results can ordered to sort ascending', () => request.get('/api/topics/mitch/articles?sort_by=article_id&sort_ascending=true').expect(200).then(({ body }) => {
      expect(body.articles[0].article_id).to.equal(1);
      expect(body.articles[1].article_id).to.equal(2);
      expect(body.articles[2].article_id).to.equal(3);
    }));
    it('GET/QUERIES - results can be offset with a page query', () => {
      request.get('/api/topics/mitch/articles?sort_by=article_id&p=2').expect(200).then(({ body }) => {
        expect(body.articles[0].article_id).to.equal(1);
      });
    });
    it('GET/QUERIES - if page query is non-number, returns 400', () => request.get('/api/topics/mitch/articles?p=cats').expect(400));
    it('GET/QUERIES - if page query is float, returns 400', () => request.get('/api/topics/mitch/articles?p=7.3').expect(400));
    it('GET - returns 404 if given non existant topic', () => request.get('/api/topics/competenttraincompanies/articles').expect(404));
    it('POST - returns 200 and an object with the posted value', () => {
      const catObj = { title: 'An underappreciated culinary opportunity?', body: 'Probably, but I\'m not going to try it', created_by: '3' };
      return request.post('/api/topics/cats/articles').send(catObj).expect(201).then(({ body }) => {
        expect(body.article).to.haveOwnProperty('article_id');
        expect(body.article.article_id).to.equal(13);
      });
    });
    it('POST - returns 400 if not enough fields are provided', () => {
      const catObj = { body: 'Probably, but I\'m not going to try it', created_by: '3' };
      return request.post('/api/topics/cats/articles').send(catObj).expect(400);
    });
    it('POST - returns 404 if topic parameter doesnt exist', () => {
      const catObj = { title: 'An underappreciated culinary opportunity?', body: 'Probably, but I\'m not going to try it', created_by: '3' };
      return request.post('/api/topics/bats/articles').send(catObj).expect(404);
    });
    it('POST - returns 404 if user value doesnt exist', () => {
      const catObj = { title: 'An underappreciated culinary opportunity?', body: 'Probably, but I\'m not going to try it', created_by: '674' };
      return request.post('/api/topics/cats/articles').send(catObj).expect(404);
    });
    it('OTHER - returns status 405 if user tries an unavailable method', () => request.put('/api/topics/cats/articles').expect(405));
  });
  describe('/articles', () => {
    it('GET - returns all articles with username and comment counts attached', () => request.get('/api/articles').expect(200).then(({ body }) => {
      expect(body.articles).to.have.length(10);
      expect(body.articles[0]).to.have.all.keys('author', 'title', 'article_id', 'votes', 'comment_count', 'created_at', 'topic');
      expect(body.articles[3]).to.have.all.keys('author', 'title', 'article_id', 'votes', 'comment_count', 'created_at', 'topic');
    }));
    it('GET/QUERIES - can be limited to x articles', () => request.get('/api/articles?limit=5').expect(200).then(({ body }) => {
      expect(body.articles).to.have.length(5);
    }));
    it('GET/QUERIES - will return 400 if limit is non number', () => request.get('/api/articles?limit=pancakes').expect(400));
    it('GET/QUERIES - will return 400 if limit is float', () => request.get('/api/articles?limit=3.6').expect(400));
    it('GET/QUERIES - can be sorted by column', () => request.get('/api/articles?limit=5&sort_by=article_id').expect(200).then(({ body }) => {
      expect(body.articles).to.have.length(5);
      expect(body.articles[0].article_id).to.equal(12);
      expect(body.articles[1].article_id).to.equal(11);
    }));
    it('GET/QUERIES - if sort query column doesnt exist, return 200 and default to date ', () => request.get('/api/articles?sort_by=google').expect(200).then(({ body }) => {
      expect(body.articles[0].article_id).to.equal(1);
    }));
    it('GET/QUERIES - if sort query column is bad syntax, return 400', () => request.get('/api/articles?sort_by=8694').expect(400));
    it('GET/QUERIES - can be sorted by column and sorted ascendingly', () => request.get('/api/articles?limit=7&sort_by=article_id&sort_ascending=true').expect(200).then(({ body }) => {
      expect(body.articles).to.have.length(7);
      expect(body.articles[0].article_id).to.equal(1);
      expect(body.articles[1].article_id).to.equal(2);
    }));
    it('GET/QUERIES - will default to descending if a bad value is passed to sort ascending', () => request.get('/api/articles?limit=7&sort_by=article_id&sort_ascending=cheese').expect(200).then(({ body }) => {
      expect(body.articles).to.have.length(7);
      expect(body.articles[0].article_id).to.equal(12);
      expect(body.articles[1].article_id).to.equal(11);
    }));
    it('GET/QUERIES - can be given a page query to offset results', () => request.get('/api/articles?limit=6&sort_by=article_id&sort_ascending=true&p=2').expect(200).then(({ body }) => {
      expect(body.articles).to.have.length(6);
      expect(body.articles[0].article_id).to.equal(7);
      expect(body.articles[1].article_id).to.equal(8);
    }));
    it('GET/QUERIES - will return 400 if page is non number', () => request.get('/api/articles?p=pancakes').expect(400));
    it('GET/QUERIES - will return 400 if page is float', () => request.get('/api/articles?p=4.8').expect(400));
    it('OTHER - returns status 405 if user tries an unavailable method', () => request.put('/api/articles').expect(405));
  });
  describe('/api/articles/:article_id', () => {
    it('GET - returns 200 and a single article by id', () => request.get('/api/articles/1').expect(200).then(({ body }) => {
      expect(body.article.title).to.equal('Living in the shadow of a great man');
    }));
    it('GET - a non-existant article id will return 404', () => request.get('/api/articles/648').expect(404));
    it('GET - a non-integer article id will return 400', () => request.get('/api/articles/steven').expect(400));
    it('PATCH - can increment article votes up', () => request.patch('/api/articles/7/').send({ inc_votes: 5 }).expect(200).then(({ body }) => {
      expect(body.article.title).to.equal('Z');
      expect(body.article.votes).to.equal(5);
    }));
    it('PATCH - can increment article votes down', () => request.patch('/api/articles/1/').send({ inc_votes: -10 }).expect(200).then(({ body }) => {
      expect(body.article.title).to.equal('Living in the shadow of a great man');
      expect(body.article.votes).to.equal(90);
    }));
    it('PATCH - providing an empty object will return an unmodified article', () => request.patch('/api/articles/1/').send({ }).expect(200).then(({ body }) => {
      expect(body.article.votes).to.equal(100);
    }));
    it('PATCH - an incorrect vote object with bad property names will 400', () => request.patch('/api/articles/1/').send({ vote: -10 }).expect(400));
    it('PATCH - an incorrect vote object with non-number syntax return 400', () => request.patch('/api/articles/1/').send({ inc_votes: 'gravy' }).expect(400));
    it('PATCH - an incorrect vote object with float syntax return 400', () => request.patch('/api/articles/1/').send({ inc_votes: 7.5 }).expect(400));
    it('PATCH - an invalid article id will 404', () => request.patch('/api/articles/476/').send({ inc_votes: -10 }).expect(404));
    it('DELETE - deleted the article associated with the given article id', () => request.delete('/api/articles/1/').expect(204).then((res) => {
      expect(res.body).to.eql({});
    }));
    it('DELETE - a non integer id will return 400', () => request.delete('/api/articles/hello/').expect(400));
    it('DELETE - a non existing id will return 404', () => request.delete('/api/articles/674/').expect(404));
    it('OTHER - returns status 405 if user tries an unavailable method', () => request.put('/api/articles/1').expect(405));
  });
  describe('/api/articles/:article_id/comments', () => {
    it('GET - returns an array of comments with creator usernames', () => request.get('/api/articles/1/comments?limit=99').expect(200).then(({ body }) => {
      expect(body.comments[0]).that.have.all.keys('comment_id', 'votes', 'created_at', 'author', 'body');
      expect(body.comments).to.have.length(13);
    }));
    it('GET - a non-existant article, or an article with no comments, will return 404', (() => request.get('/api/articles/684/comments').expect(404)));
    it('GET - can sort by author', (() => request.get('/api/articles/1/comments?sort_by=author').expect(200)));
    it('GET - bad article id parameter syntax will return 400', (() => request.get('/api/articles/mitchfacts/comments').expect(400)));
    it('GET/QUERIES - able to limit responses', (() => request.get('/api/articles/1/comments?limit=7').expect(200).then(({ body }) => {
      expect(body.comments).to.have.length(7);
    })));
    it('GET/QUERIES - limit defaults at 10', (() => request.get('/api/articles/1/comments').expect(200).then(({ body }) => {
      expect(body.comments).to.have.length(10);
    })));
    it('GET/QUERIES - a non-int limit will return 400', (() => request.get('/api/articles/1/comments?limit=heese').expect(400)));
    it('GET/QUERIES - Able to sort, defaulting to descending dates', () => request.get('/api/articles/1/comments?limit=13').expect(200).then(({ body }) => {
      expect(body.comments[0].body).to.equal('The beautiful thing about treasure is that it exists. Got to find out what kind of sheets these are; not cotton, not rayon, silky.');
      expect(body.comments[12].body).to.equal('This morning, I showered for nine minutes.');
    }));
    it('GET/QUERIES - attempting to sort a non existant column will default to date and return 200', () => request.get('/api/articles/1/comments?limit=13&sort_by=pirates').expect(200).then(({ body }) => {
      expect(body.comments[0].body).to.equal('The beautiful thing about treasure is that it exists. Got to find out what kind of sheets these are; not cotton, not rayon, silky.');
      expect(body.comments[12].body).to.equal('This morning, I showered for nine minutes.');
    }));
    it('GET/QUERIES - attempting to sort with bad syntax will return 400', () => request.get('/api/articles/1/comments?limit=13&sort_by=25723').expect(400));
    it('GET/QUERIES - Able to change sort order', () => request.get('/api/articles/1/comments?limit=13&sort_ascending=true').expect(200).then(({ body }) => {
      expect(body.comments[12].body).to.equal('The beautiful thing about treasure is that it exists. Got to find out what kind of sheets these are; not cotton, not rayon, silky.');
      expect(body.comments[0].body).to.equal('This morning, I showered for nine minutes.');
    }));
    it('GET/QUERIES - providing a non-bool value for sort_ascending will default to descending', () => request.get('/api/articles/1/comments?limit=13&sort_ascending=tomato').expect(200).then(({ body }) => {
      expect(body.comments[0].body).to.equal('The beautiful thing about treasure is that it exists. Got to find out what kind of sheets these are; not cotton, not rayon, silky.');
      expect(body.comments[12].body).to.equal('This morning, I showered for nine minutes.');
    }));
    it('GET/QUERIES - Allows a page query to specify offset', () => request.get('/api/articles/1/comments?limit=3&p=2&sort_by=comment_id&sort_ascending=true').expect(200).then(({ body }) => {
      expect(body.comments[0].comment_id).to.equal(5);
      expect(body.comments[1].comment_id).to.equal(6);
    }));
    it('GET/QUERIES - a non-int page will return 400', (() => request.get('/api/articles/1/comments?p=hello').expect(400)));
    it('POST - takes a body and user id and posts the comment to the article', () => request.post('/api/articles/2/comments').send({ body: 'Transpennine express is an exceptionally poor rail operator', user_id: '3' }).expect(201).then(({ body }) => {
      expect(body.comment).to.have.all.keys('body', 'comment_id', 'article_id', 'user_id', 'created_at', 'votes');
      expect(body.comment.comment_id).to.be.a('number');
      expect(body.comment.comment_id).to.be.greaterThan(0);
    }));
    it('POST - failing to provide all comment fields will return 400', () => request.post('/api/articles/2/comments').send({ badComment: 'I love transpennine' }).expect(400));
    it('POST - providing correct fields but with bad syntax will return 400', () => request.post('/api/articles/2/comments').send({ body: 'Transpennine express is an exceptionally poor rail operator', user_id: 'bary' }).expect(400));
    it('POST - a bad article parameter will return a 404', () => request.post('/api/articles/999/comments').send({ body: 'Transpennine express is an exceptionally poor rail operator', user_id: '3' }).expect(404));
    it('POST - a non existant user will return a 404', () => request.post('/api/articles/999/comments').send({ body: 'Transpennine express is an exceptionally poor rail operator', user_id: '98' }).expect(404));
    it('OTHER - returns status 405 if user tries an unavailable method', () => request.put('/api/articles/1/comments').expect(405));
  });
  describe('/:article_id/comments/:comment_id', () => {
    it('PATCH - Allows a comment to be voted up', () => request.patch('/api/articles/2/comments/1').send({ inc_votes: 7 }).expect(201).then(({ body }) => {
      expect(body.comment.votes).to.equal(23);
    }));
    it('PATCH - Allows a comment to be voted down', () => request.patch('/api/articles/7659/comments/1').send({ inc_votes: -6 }).expect(201).then(({ body }) => {
      expect(body.comment.votes).to.equal(10);
    }));
    it('PATCH - empty body returns 201 and unmodified obj', () => request.patch('/api/articles/1/comments/1').send({ }).expect(201).then(({ body }) => {
      expect(body.comment.votes).to.equal(16);
    }));
    it('PATCH - returns 404 if comment id does not exist', () => request.patch('/api/articles/2/comments/107').send({ inc_votes: 1 }).expect(404));
    it('PATCH - an incorrect vote object with bad property names will 400', () => request.patch('/api/articles/2/comments/1/').send({ vote: -10 }).expect(400));
    it('PATCH - an incorrect vote object with non-number syntax return 400', () => request.patch('/api/articles/2/comments/1/').send({ inc_votes: 'gravy' }).expect(400));
    it('PATCH - an incorrect vote object with float syntax return 400', () => request.patch('/api/articles/2/comments/1/').send({ inc_votes: 7.5 }).expect(400));
    it('DELETE - Deletes a comment and returns an empty object', () => request.delete('/api/articles/2/comments/1').expect(204).then(({ body }) => { expect(body).to.eql({}); }));
    it('DELETE - returns 404 if comment id does not exist', () => request.delete('/api/articles/2/comments/47431').expect(404));
    it('DELETE - returns 400 if comment id is not an integer', () => request.delete('/api/articles/2/comments/thisone').expect(400));
    it('OTHER - returns status 405 if user tries an unavailable method', () => request.put('/api/articles/1/comments/1').expect(405));
  });
  describe('/api/users & /:user_id', () => {
    it('GET - /users returns 200 and all users', () => request.get('/api/users').expect(200).then(({ body }) => {
      expect(body.users).that.have.length(3);
      expect(body.users[0]).to.have.all.keys('user_id', 'username', 'avatar_url', 'name');
    }));
    it('OTHER - /users - will return 405 if non-get method is used', () => request.delete('/api/users').expect(405));
    it('GET - /users/:user_id returns 200 and a user object', () => request.get('/api/users/2').expect(200).then(({ body }) => {
      expect(body.user).to.have.all.keys('user_id', 'username', 'avatar_url', 'name');
      expect(body.user.name).to.equal('sam');
    }));
    it('GET - requesting a non-existant user-id will return 404', () => request.get('/api/users/27').expect(404));
    it('GET - requesting a user id with bad syntax will return 400', () => request.get('/api/users/dave').expect(400));
    it('OTHER - /users/:user_id - will return 405 if non-get method is used', () => request.delete('/api/users/6').expect(405));
  });

  describe('/api', () => {
    it('GET - returns a json of all available endpoints', () => request.get('/api').expect(200).then(({ body }) => {
      expect(body.paths[0]).to.have.all.keys('path', 'methods');
      expect(body.paths[0].methods).to.be.an('array');
    }));
    it('OTHER - /api - will return 405 if non-get method is used', () => request.delete('/api').expect(405));
  });
});
