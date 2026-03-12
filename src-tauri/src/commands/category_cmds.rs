use tauri::State;

use crate::db::models::Category;
use crate::db::{categories, DbState};

#[tauri::command]
pub fn create_category(state: State<DbState>, name: String) -> Result<Category, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    categories::create_category(&conn, &name).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn update_category(state: State<DbState>, id: String, name: String, sort_order: i32) -> Result<Category, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    categories::update_category(&conn, &id, &name, sort_order).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_category(state: State<DbState>, id: String) -> Result<(), String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    categories::delete_category(&conn, &id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn list_categories(state: State<DbState>) -> Result<Vec<Category>, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    categories::list_categories(&conn).map_err(|e| e.to_string())
}
