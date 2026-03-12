use tauri::State;

use crate::db::models::Tag;
use crate::db::{tags, DbState};

#[tauri::command]
pub fn create_tag(state: State<DbState>, name: String) -> Result<Tag, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    tags::create_tag(&conn, &name).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_tag(state: State<DbState>, id: String) -> Result<(), String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    tags::delete_tag(&conn, &id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn list_tags(state: State<DbState>) -> Result<Vec<Tag>, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    tags::list_tags(&conn).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn add_article_tag(state: State<DbState>, article_id: String, tag_id: String) -> Result<(), String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    tags::add_article_tag(&conn, &article_id, &tag_id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn remove_article_tag(state: State<DbState>, article_id: String, tag_id: String) -> Result<(), String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    tags::remove_article_tag(&conn, &article_id, &tag_id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_article_tags(state: State<DbState>, article_id: String) -> Result<Vec<Tag>, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    tags::get_article_tags(&conn, &article_id).map_err(|e| e.to_string())
}
