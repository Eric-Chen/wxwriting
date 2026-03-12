use tauri::State;

use crate::db::models::WxAccount;
use crate::db::{wx_accounts, DbState};

#[tauri::command]
pub fn save_wx_account(
    state: State<DbState>,
    name: String,
    app_id: String,
    app_secret: String,
) -> Result<WxAccount, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    wx_accounts::save_wx_account(&conn, &name, &app_id, &app_secret).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_wx_account(state: State<DbState>) -> Result<WxAccount, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    wx_accounts::get_wx_account(&conn).map_err(|e| e.to_string())
}
