use tauri::State;
use crate::db::{wx_accounts, articles, images, DbState};
use crate::wx_api::{WxApiClient, DraftArticle};

fn get_account_info(state: &State<DbState>) -> Result<(String, String, String, String, Option<String>), String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    let account = wx_accounts::get_wx_account(&conn).map_err(|e| e.to_string())?;
    Ok((account.id, account.app_id, account.app_secret, account.access_token, account.token_expires_at))
}

fn save_token(state: &State<DbState>, id: &str, token: &str, expiry: &str) -> Result<(), String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    wx_accounts::update_access_token(&conn, id, token, expiry).map_err(|e| e.to_string())
}

async fn ensure_token(state: &State<'_, DbState>) -> Result<String, String> {
    let (id, app_id, app_secret, access_token, token_expires_at) = get_account_info(state)?;

    if let Some(expires_at) = &token_expires_at {
        let now = chrono::Utc::now().format("%Y-%m-%d %H:%M:%S").to_string();
        if expires_at > &now && !access_token.is_empty() {
            return Ok(access_token);
        }
    }

    let client = WxApiClient::new();
    let token_resp = client.get_access_token(&app_id, &app_secret).await?;
    let expiry = WxApiClient::calculate_token_expiry(token_resp.expires_in);
    save_token(state, &id, &token_resp.access_token, &expiry)?;
    Ok(token_resp.access_token)
}

#[tauri::command]
pub async fn refresh_access_token(state: State<'_, DbState>) -> Result<String, String> {
    let (id, app_id, app_secret, _, _) = get_account_info(&state)?;

    let client = WxApiClient::new();
    let token_resp = client.get_access_token(&app_id, &app_secret).await?;
    let expiry = WxApiClient::calculate_token_expiry(token_resp.expires_in);
    save_token(&state, &id, &token_resp.access_token, &expiry)?;
    Ok(token_resp.access_token)
}

#[tauri::command]
pub async fn get_valid_access_token(state: State<'_, DbState>) -> Result<String, String> {
    ensure_token(&state).await
}

#[tauri::command]
pub async fn upload_wx_image(
    state: State<'_, DbState>,
    image_id: String,
) -> Result<String, String> {
    let file_path = {
        let conn = state.0.lock().map_err(|e| e.to_string())?;
        let image = images::get_image(&conn, &image_id).map_err(|e| e.to_string())?;
        image.file_path
    };

    let token = ensure_token(&state).await?;
    let client = WxApiClient::new();
    let upload_resp = client.upload_article_image(&token, &file_path).await?;

    {
        let conn = state.0.lock().map_err(|e| e.to_string())?;
        images::update_image_wx(&conn, &image_id, &upload_resp.media_id, &upload_resp.url)
            .map_err(|e| e.to_string())?;
    }

    Ok(upload_resp.url)
}

#[tauri::command]
pub async fn test_wx_connection(state: State<'_, DbState>) -> Result<String, String> {
    refresh_access_token(state).await?;
    Ok("Connection successful".to_string())
}

#[tauri::command]
pub async fn publish_article_to_wx(
    state: State<'_, DbState>,
    article_id: String,
    thumb_media_id: String,
) -> Result<String, String> {
    let (title, author, digest, html_content) = {
        let conn = state.0.lock().map_err(|e| e.to_string())?;
        let article = articles::get_article(&conn, &article_id).map_err(|e| e.to_string())?;
        (article.title, article.author, article.digest, article.html_content)
    };

    let token = ensure_token(&state).await?;
    let client = WxApiClient::new();

    let draft_article = DraftArticle {
        title,
        author,
        digest,
        content: html_content,
        thumb_media_id,
    };

    let draft_resp = client.add_draft(&token, draft_article).await?;

    {
        let conn = state.0.lock().map_err(|e| e.to_string())?;
        articles::set_article_published(&conn, &article_id, &draft_resp.media_id)
            .map_err(|e| e.to_string())?;
    }

    Ok(draft_resp.media_id)
}
