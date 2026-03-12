use rusqlite::{params, Connection, Result};
use uuid::Uuid;

use super::models::Tag;

pub fn create_tag(conn: &Connection, name: &str) -> Result<Tag> {
    let id = Uuid::new_v4().to_string();
    conn.execute("INSERT INTO tags (id, name) VALUES (?1, ?2)", params![id, name])?;
    Ok(Tag { id, name: name.to_string() })
}

pub fn delete_tag(conn: &Connection, id: &str) -> Result<()> {
    conn.execute("DELETE FROM article_tags WHERE tag_id=?1", params![id])?;
    conn.execute("DELETE FROM tags WHERE id=?1", params![id])?;
    Ok(())
}

pub fn list_tags(conn: &Connection) -> Result<Vec<Tag>> {
    let mut stmt = conn.prepare("SELECT id, name FROM tags ORDER BY name ASC")?;
    let rows = stmt.query_map([], |row| {
        Ok(Tag { id: row.get(0)?, name: row.get(1)? })
    })?;
    rows.collect()
}

pub fn add_article_tag(conn: &Connection, article_id: &str, tag_id: &str) -> Result<()> {
    conn.execute(
        "INSERT OR IGNORE INTO article_tags (article_id, tag_id) VALUES (?1, ?2)",
        params![article_id, tag_id],
    )?;
    Ok(())
}

pub fn remove_article_tag(conn: &Connection, article_id: &str, tag_id: &str) -> Result<()> {
    conn.execute(
        "DELETE FROM article_tags WHERE article_id=?1 AND tag_id=?2",
        params![article_id, tag_id],
    )?;
    Ok(())
}

pub fn get_article_tags(conn: &Connection, article_id: &str) -> Result<Vec<Tag>> {
    let mut stmt = conn.prepare(
        "SELECT t.id, t.name FROM tags t INNER JOIN article_tags at ON t.id = at.tag_id WHERE at.article_id = ?1 ORDER BY t.name"
    )?;
    let rows = stmt.query_map(params![article_id], |row| {
        Ok(Tag { id: row.get(0)?, name: row.get(1)? })
    })?;
    rows.collect()
}
