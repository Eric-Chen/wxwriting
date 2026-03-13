use rusqlite::{params, Connection, Result};
use uuid::Uuid;

use super::models::Image;

pub fn create_image(
    conn: &Connection,
    filename: &str,
    file_path: &str,
    file_size: i64,
    mime_type: &str,
    width: i32,
    height: i32,
    group_name: &str,
) -> Result<Image> {
    let id = Uuid::new_v4().to_string();
    let now = chrono::Utc::now().format("%Y-%m-%d %H:%M:%S").to_string();
    conn.execute(
        "INSERT INTO images (id, filename, file_path, file_size, mime_type, width, height, group_name, created_at) VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9)",
        params![id, filename, file_path, file_size, mime_type, width, height, group_name, now],
    )?;
    get_image(conn, &id)
}

pub fn get_image(conn: &Connection, id: &str) -> Result<Image> {
    conn.query_row(
        "SELECT id, filename, file_path, file_size, mime_type, width, height, group_name, wx_media_id, wx_url, created_at FROM images WHERE id=?1",
        params![id],
        |row| Ok(Image {
            id: row.get(0)?, filename: row.get(1)?, file_path: row.get(2)?,
            file_size: row.get(3)?, mime_type: row.get(4)?, width: row.get(5)?,
            height: row.get(6)?, group_name: row.get(7)?, wx_media_id: row.get(8)?,
            wx_url: row.get(9)?, created_at: row.get(10)?,
        }),
    )
}

pub fn delete_image(conn: &Connection, id: &str) -> Result<String> {
    let path: String = conn.query_row(
        "SELECT file_path FROM images WHERE id=?1", params![id], |row| row.get(0),
    )?;
    conn.execute("DELETE FROM images WHERE id=?1", params![id])?;
    Ok(path)
}

pub fn list_images(conn: &Connection, group_name: Option<&str>) -> Result<Vec<Image>> {
    let (sql, param_values): (String, Vec<Box<dyn rusqlite::types::ToSql>>) = match group_name {
        Some(g) => (
            "SELECT id, filename, file_path, file_size, mime_type, width, height, group_name, wx_media_id, wx_url, created_at FROM images WHERE group_name=? ORDER BY created_at DESC".into(),
            vec![Box::new(g.to_string())],
        ),
        None => (
            "SELECT id, filename, file_path, file_size, mime_type, width, height, group_name, wx_media_id, wx_url, created_at FROM images ORDER BY created_at DESC".into(),
            vec![],
        ),
    };
    let params_ref: Vec<&dyn rusqlite::types::ToSql> = param_values.iter().map(|p| p.as_ref()).collect();
    let mut stmt = conn.prepare(&sql)?;
    let rows = stmt.query_map(params_ref.as_slice(), |row| {
        Ok(Image {
            id: row.get(0)?, filename: row.get(1)?, file_path: row.get(2)?,
            file_size: row.get(3)?, mime_type: row.get(4)?, width: row.get(5)?,
            height: row.get(6)?, group_name: row.get(7)?, wx_media_id: row.get(8)?,
            wx_url: row.get(9)?, created_at: row.get(10)?,
        })
    })?;
    rows.collect()
}

pub fn update_image_wx(conn: &Connection, id: &str, wx_media_id: &str, wx_url: &str) -> Result<()> {
    conn.execute(
        "UPDATE images SET wx_media_id=?1, wx_url=?2 WHERE id=?3",
        params![wx_media_id, wx_url, id],
    )?;
    Ok(())
}

pub fn update_image_group(conn: &Connection, id: &str, group_name: &str) -> Result<()> {
    conn.execute(
        "UPDATE images SET group_name=?1 WHERE id=?2",
        params![group_name, id],
    )?;
    Ok(())
}

pub fn rename_image_group(conn: &Connection, old_name: &str, new_name: &str) -> Result<usize> {
    let count = conn.execute(
        "UPDATE images SET group_name=?1 WHERE group_name=?2",
        params![new_name, old_name],
    )?;
    Ok(count)
}

pub fn delete_image_group(conn: &Connection, group_name: &str) -> Result<usize> {
    let count = conn.execute(
        "UPDATE images SET group_name='' WHERE group_name=?1",
        params![group_name],
    )?;
    Ok(count)
}
