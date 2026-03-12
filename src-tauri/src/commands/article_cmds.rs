use tauri::State;

use crate::db::models::Article;
use crate::db::{articles, DbState};

#[tauri::command]
pub fn create_article(state: State<DbState>, title: String, content: String) -> Result<Article, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    articles::create_article(&conn, &title, &content).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_article(state: State<DbState>, id: String) -> Result<Article, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    articles::get_article(&conn, &id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn update_article(
    state: State<DbState>,
    id: String,
    title: String,
    content: String,
    html_content: String,
    category_id: Option<String>,
    status: String,
    cover_image_id: Option<String>,
    author: String,
    digest: String,
) -> Result<Article, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    articles::update_article(
        &conn, &id, &title, &content, &html_content,
        category_id.as_deref(), &status, cover_image_id.as_deref(),
        &author, &digest,
    ).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_article(state: State<DbState>, id: String) -> Result<(), String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    articles::delete_article(&conn, &id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn list_articles(
    state: State<DbState>,
    category_id: Option<String>,
    status: Option<String>,
    search: Option<String>,
) -> Result<Vec<Article>, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    articles::list_articles(
        &conn, category_id.as_deref(), status.as_deref(), search.as_deref(),
    ).map_err(|e| e.to_string())
}
