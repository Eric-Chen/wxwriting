use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Article {
    pub id: String,
    pub title: String,
    pub content: String,
    pub html_content: String,
    pub category_id: Option<String>,
    pub status: String,
    pub cover_image_id: Option<String>,
    pub wx_media_id: Option<String>,
    pub author: String,
    pub digest: String,
    pub created_at: String,
    pub updated_at: String,
    pub published_at: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Category {
    pub id: String,
    pub name: String,
    pub sort_order: i32,
    pub created_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Tag {
    pub id: String,
    pub name: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Image {
    pub id: String,
    pub filename: String,
    pub file_path: String,
    pub file_size: i64,
    pub mime_type: String,
    pub width: i32,
    pub height: i32,
    pub group_name: String,
    pub wx_media_id: Option<String>,
    pub wx_url: Option<String>,
    pub created_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct WxAccount {
    pub id: String,
    pub name: String,
    pub app_id: String,
    pub app_secret: String,
    pub access_token: String,
    pub token_expires_at: Option<String>,
}
