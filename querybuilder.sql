\c test_nc_news
SELECT count(comment_id), title FROM comments JOIN articles ON articles.article_id = comments.article_id
GROUP BY articles.title;