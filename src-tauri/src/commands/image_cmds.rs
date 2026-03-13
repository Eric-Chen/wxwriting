use tauri::State;

use crate::db::models::Image;
use crate::db::{images, DbState};

#[tauri::command]
pub fn create_image(
    state: State<DbState>,
    filename: String,
    file_path: String,
    file_size: i64,
    mime_type: String,
    width: i32,
    height: i32,
    group_name: String,
) -> Result<Image, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    images::create_image(&conn, &filename, &file_path, file_size, &mime_type, width, height, &group_name)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_image(state: State<DbState>, id: String) -> Result<Image, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    images::get_image(&conn, &id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_image(state: State<DbState>, id: String) -> Result<String, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    images::delete_image(&conn, &id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn list_images(state: State<DbState>, group_name: Option<String>) -> Result<Vec<Image>, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    images::list_images(&conn, group_name.as_deref()).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn update_image_group(state: State<DbState>, id: String, group_name: String) -> Result<(), String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    images::update_image_group(&conn, &id, &group_name).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn rename_image_group(state: State<DbState>, old_name: String, new_name: String) -> Result<usize, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    images::rename_image_group(&conn, &old_name, &new_name).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_image_group(state: State<DbState>, group_name: String) -> Result<usize, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    images::delete_image_group(&conn, &group_name).map_err(|e| e.to_string())
}
