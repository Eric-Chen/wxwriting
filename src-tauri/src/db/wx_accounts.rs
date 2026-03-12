use rusqlite::{params, Connection, Result};
use uuid::Uuid;

use super::models::WxAccount;

pub fn save_wx_account(
    conn: &Connection,
    name: &str,
    app_id: &str,
    app_secret: &str,
) -> Result<WxAccount> {
    let existing: Option<String> = conn
        .query_row("SELECT id FROM wx_accounts LIMIT 1", [], |row| row.get(0))
        .ok();

    let id = existing.unwrap_or_else(|| Uuid::new_v4().to_string());
    conn.execute(
        "INSERT OR REPLACE INTO wx_accounts (id, name, app_id, app_secret) VALUES (?1,?2,?3,?4)",
        params![id, name, app_id, app_secret],
    )?;
    get_wx_account(conn)
}

pub fn get_wx_account(conn: &Connection) -> Result<WxAccount> {
    conn.query_row(
        "SELECT id, name, app_id, app_secret, access_token, token_expires_at FROM wx_accounts LIMIT 1",
        [],
        |row| Ok(WxAccount {
            id: row.get(0)?, name: row.get(1)?, app_id: row.get(2)?,
            app_secret: row.get(3)?, access_token: row.get(4)?,
            token_expires_at: row.get(5)?,
        }),
    )
}

pub fn update_access_token(conn: &Connection, id: &str, token: &str, expires_at: &str) -> Result<()> {
    conn.execute(
        "UPDATE wx_accounts SET access_token=?1, token_expires_at=?2 WHERE id=?3",
        params![token, expires_at, id],
    )?;
    Ok(())
}
