## Endpoints

 This server hosts the following endpoints

#### /api/topics
- GET
```
Returns a json of all available topics with slug and description properties
```
* POST
```
Posts a new new topic to the database. Client must send an object containing 'slug' and 'description' properties. The slug must be unique, and will return a 422 error if it is already present in the database Returns the posted item
```

#### /api/topics/:topic/articles
- GET
```
Returns all articles relating to the provided topic in json format, with accompanying creation, comment and user data.

Results can be formatted with the following queries:

limit
An integer, max results to display on a page. Defaults to 10.

p
(Page) An integer, offsets results in accordance with the limit. Defaults to 1

sort_by
Text, column title to order results by. Defaults to created_at (date).

sort_ascending
Boolean, ditates the direction a sort occurs. Defaults to false (descending).
```
- POST
```
Posts a new article to the database. The topic must already exist in the database, and requires an object in the following format:

{ title: text, body: text, created_by: user_id }

Content need not be unique, but the user_id must already exist in the database. Returns the posted item
```

#### /api/articles
- GET
```
Returns all articles in json format, with accompanying creation, comment and user data.

Results can be formatted with the following queries:

limit
An integer, max results to display on a page. Defaults to 10.

p
(Page) An integer, offsets results in accordance with the limit. Defaults to 1

sort_by
Text, column title to order results by. Defaults to created_at (date).

sort_ascending
Boolean, ditates the direction a sort occurs. Defaults to false (descending).
```

#### /api/articles/:article_id
- GET
```
Returns a single article with the corresponding id in json format, with accompanying creation, comment and user data.

```
- PATCH
```
Modifies the corresponding article with a vote object. The vote object must be formatted as shown:

{ inc_votes: number }

The number should be a non-float number and can be positive or negative. The modified article will be returned
```
- DELETE
```
Deletes a single article that corresponds to the provided article id. An empy object will be returned upon successful deletion.
```

#### /api/articles/:article_id/comments
- GET
```
Returns all comment data associated with the article id in json format.

Results can be formatted with the following queries:

limit
An integer, max results to display on a page. Defaults to 10.

p
(Page) An integer, offsets results in accordance with the limit. Defaults to 1

sort_by
Text, column title to order results by. Defaults to created_at (date).

sort_ascending
Boolean, ditates the direction a sort occurs. Defaults to false (descending).
```
- POST
```
Posts a new comment to the associated article id. The request should be structured as shown:

{ body: Text, user_id: Integer }

The body need not be unique, but the user id must exist in the database. The created comment will be returned as a json

```

#### /api/articles/:article_id/comments/:comment_id
- PATCH
```
Modifies a comment with the corresponding comment id with a vote object. The vote object should be structured as shown:

{ inc_votes: number }

The number can be positive or negative, but must not be a float value. The modified comment will be returned
```
- DELETE
```
Deletes a single comment that corresponds to the provided comment id. An empy object will be returned upon successful deletion.
```

#### /api/users
- GET
```
Returns all users and their user ids in json format
```

#### /api/users/:user_id
- GET
```
Returns an individual user with the corresponding user id in json format
```

#### /api
- GET
```
Returns a json of all api endpoints and their available methods.
```