
exports.up = function (knex, Promise) {
  return knex.schema.createTable('comments', (comTable) => {
    comTable.increments('comment_id').primary();
    comTable.integer('user_id').references('users.user_id');
    comTable.integer('article_id').references('articles.article_id').onDelete('CASCADE');
    comTable.integer('votes').defaultTo(0);
    comTable.timestamp('created_at').defaultTo(knex.fn.now());
    comTable.text('body');
  });
};

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('comments');
};
