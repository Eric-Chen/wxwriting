use rusqlite::{params, Connection, Result};
use uuid::Uuid;

use super::models::Category;

pub fn create_category(conn: &Connection, name: &str) -> Result<Category> {
    let id = Uuid::new_v4().to_string();
    conn.execute(
        "INSERT INTO categories (id, name) VALUES (?1, ?2)",
        params![id, name],
    )?;
    get_category(conn, &id)
}

pub fn get_category(conn: &Connection, id: &str) -> Result<Category> {
    conn.query_row(
        "SELECT id, name, sort_order, created_at FROM categories WHERE id = ?1",
        params![id],
        |row| Ok(Category {
            id: row.get(0)?,
            name: row.get(1)?,
            sort_order: row.get(2)?,
            created_at: row.get(3)?,
        }),
    )
}

pub fn update_category(conn: &Connection, id: &str, name: &str, sort_order: i32) -> Result<Category> {
    conn.execute(
        "UPDATE categories SET name=?1, sort_order=?2 WHERE id=?3",
        params![name, sort_order, id],
    )?;
    get_category(conn, id)
}

pub fn delete_category(conn: &Connection, id: &str) -> Result<()> {
    conn.execute("UPDATE articles SET category_id=NULL WHERE category_id=?1", params![id])?;
    conn.execute("DELETE FROM categories WHERE id=?1", params![id])?;
    Ok(())
}

pub fn list_categories(conn: &Connection) -> Result<Vec<Category>> {
    let mut stmt = conn.prepare(
        "SELECT id, name, sort_order, created_at FROM categories ORDER BY sort_order ASC, name ASC"
    )?;
    let rows = stmt.query_map([], |row| {
        Ok(Category {
            id: row.get(0)?,
            name: row.get(1)?,
            sort_order: row.get(2)?,
            created_at: row.get(3)?,
        })
    })?;
    rows.collect()
}
