use rusqlite::{params, Connection, Result};
use uuid::Uuid;

use super::models::Article;

pub fn create_article(conn: &Connection, title: &str, content: &str) -> Result<Article> {
    let id = Uuid::new_v4().to_string();
    let now = chrono::Utc::now().format("%Y-%m-%d %H:%M:%S").to_string();
    conn.execute(
        "INSERT INTO articles (id, title, content, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5)",
        params![id, title, content, now, now],
    )?;
    get_article(conn, &id)
}

pub fn get_article(conn: &Connection, id: &str) -> Result<Article> {
    conn.query_row(
        "SELECT id, title, content, html_content, category_id, status, cover_image_id, wx_media_id, author, digest, created_at, updated_at, published_at FROM articles WHERE id = ?1",
        params![id],
        |row| {
            Ok(Article {
                id: row.get(0)?,
                title: row.get(1)?,
                content: row.get(2)?,
                html_content: row.get(3)?,
                category_id: row.get(4)?,
                status: row.get(5)?,
                cover_image_id: row.get(6)?,
                wx_media_id: row.get(7)?,
                author: row.get(8)?,
                digest: row.get(9)?,
                created_at: row.get(10)?,
                updated_at: row.get(11)?,
                published_at: row.get(12)?,
            })
        },
    )
}

pub fn update_article(
    conn: &Connection,
    id: &str,
    title: &str,
    content: &str,
    html_content: &str,
    category_id: Option<&str>,
    status: &str,
    cover_image_id: Option<&str>,
    author: &str,
    digest: &str,
) -> Result<Article> {
    let now = chrono::Utc::now().format("%Y-%m-%d %H:%M:%S").to_string();
    conn.execute(
        "UPDATE articles SET title=?1, content=?2, html_content=?3, category_id=?4, status=?5, cover_image_id=?6, author=?7, digest=?8, updated_at=?9 WHERE id=?10",
        params![title, content, html_content, category_id, status, cover_image_id, author, digest, now, id],
    )?;
    get_article(conn, id)
}

pub fn delete_article(conn: &Connection, id: &str) -> Result<()> {
    conn.execute("DELETE FROM article_tags WHERE article_id = ?1", params![id])?;
    conn.execute("DELETE FROM articles WHERE id = ?1", params![id])?;
    Ok(())
}

pub fn list_articles(
    conn: &Connection,
    category_id: Option<&str>,
    status: Option<&str>,
    search: Option<&str>,
) -> Result<Vec<Article>> {
    let mut sql = String::from(
        "SELECT id, title, content, html_content, category_id, status, cover_image_id, wx_media_id, author, digest, created_at, updated_at, published_at FROM articles WHERE 1=1"
    );
    let mut param_values: Vec<Box<dyn rusqlite::types::ToSql>> = Vec::new();

    if let Some(cat) = category_id {
        sql.push_str(" AND category_id = ?");
        param_values.push(Box::new(cat.to_string()));
    }
    if let Some(st) = status {
        sql.push_str(" AND status = ?");
        param_values.push(Box::new(st.to_string()));
    }
    if let Some(q) = search {
        sql.push_str(" AND (title LIKE ? OR content LIKE ?)");
        let pattern = format!("%{}%", q);
        param_values.push(Box::new(pattern.clone()));
        param_values.push(Box::new(pattern));
    }
    sql.push_str(" ORDER BY updated_at DESC");

    let params_ref: Vec<&dyn rusqlite::types::ToSql> = param_values.iter().map(|p| p.as_ref()).collect();
    let mut stmt = conn.prepare(&sql)?;
    let rows = stmt.query_map(params_ref.as_slice(), |row| {
        Ok(Article {
            id: row.get(0)?,
            title: row.get(1)?,
            content: row.get(2)?,
            html_content: row.get(3)?,
            category_id: row.get(4)?,
            status: row.get(5)?,
            cover_image_id: row.get(6)?,
            wx_media_id: row.get(7)?,
            author: row.get(8)?,
            digest: row.get(9)?,
            created_at: row.get(10)?,
            updated_at: row.get(11)?,
            published_at: row.get(12)?,
        })
    })?;
    rows.collect()
}

pub fn set_article_published(conn: &Connection, id: &str, wx_media_id: &str) -> Result<()> {
    let now = chrono::Utc::now().format("%Y-%m-%d %H:%M:%S").to_string();
    conn.execute(
        "UPDATE articles SET status='published', wx_media_id=?1, published_at=?2, updated_at=?2 WHERE id=?3",
        params![wx_media_id, now, id],
    )?;
    Ok(())
}
