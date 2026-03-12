use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::time::{SystemTime, UNIX_EPOCH};

#[derive(Debug, Serialize, Deserialize)]
pub struct AccessTokenResponse {
    pub access_token: String,
    pub expires_in: i64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct WxError {
    pub errcode: i32,
    pub errmsg: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UploadImageResponse {
    pub media_id: String,
    pub url: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct DraftArticle {
    pub title: String,
    pub author: String,
    pub digest: String,
    pub content: String,
    pub thumb_media_id: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AddDraftRequest {
    pub articles: Vec<DraftArticle>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AddDraftResponse {
    pub media_id: String,
}

pub struct WxApiClient {
    client: Client,
    base_url: String,
}

impl WxApiClient {
    pub fn new() -> Self {
        Self {
            client: Client::new(),
            base_url: "https://api.weixin.qq.com".to_string(),
        }
    }

    pub async fn get_access_token(&self, app_id: &str, app_secret: &str) -> Result<AccessTokenResponse, String> {
        let url = format!(
            "{}/cgi-bin/token?grant_type=client_credential&appid={}&secret={}",
            self.base_url, app_id, app_secret
        );

        let resp = self.client.get(&url)
            .send()
            .await
            .map_err(|e| format!("Request failed: {}", e))?;

        let body = resp.text().await.map_err(|e| format!("Read response failed: {}", e))?;

        // Try to parse as error first
        if let Ok(err) = serde_json::from_str::<WxError>(&body) {
            if err.errcode != 0 {
                return Err(format!("WeChat API error {}: {}", err.errcode, err.errmsg));
            }
        }

        serde_json::from_str(&body).map_err(|e| format!("Parse response failed: {}", e))
    }

    pub async fn upload_article_image(
        &self,
        access_token: &str,
        image_path: &str,
    ) -> Result<UploadImageResponse, String> {
        let url = format!("{}/cgi-bin/media/uploadimg?access_token={}", self.base_url, access_token);

        let file_bytes = std::fs::read(image_path)
            .map_err(|e| format!("Read image file failed: {}", e))?;

        let filename = std::path::Path::new(image_path)
            .file_name()
            .and_then(|n| n.to_str())
            .unwrap_or("image.jpg");

        let part = reqwest::multipart::Part::bytes(file_bytes)
            .file_name(filename.to_string());

        let form = reqwest::multipart::Form::new().part("media", part);

        let resp = self.client.post(&url)
            .multipart(form)
            .send()
            .await
            .map_err(|e| format!("Upload request failed: {}", e))?;

        let body = resp.text().await.map_err(|e| format!("Read response failed: {}", e))?;

        if let Ok(err) = serde_json::from_str::<WxError>(&body) {
            if err.errcode != 0 {
                return Err(format!("WeChat API error {}: {}", err.errcode, err.errmsg));
            }
        }

        serde_json::from_str(&body).map_err(|e| format!("Parse response failed: {}", e))
    }

    pub async fn add_draft(
        &self,
        access_token: &str,
        article: DraftArticle,
    ) -> Result<AddDraftResponse, String> {
        let url = format!("{}/cgi-bin/draft/add?access_token={}", self.base_url, access_token);

        let req_body = AddDraftRequest { articles: vec![article] };

        let resp = self.client.post(&url)
            .json(&req_body)
            .send()
            .await
            .map_err(|e| format!("Request failed: {}", e))?;

        let body = resp.text().await.map_err(|e| format!("Read response failed: {}", e))?;

        if let Ok(err) = serde_json::from_str::<WxError>(&body) {
            if err.errcode != 0 {
                return Err(format!("WeChat API error {}: {}", err.errcode, err.errmsg));
            }
        }

        serde_json::from_str(&body).map_err(|e| format!("Parse response failed: {}", e))
    }

    pub fn calculate_token_expiry(expires_in: i64) -> String {
        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs() as i64;
        let expiry = now + expires_in - 300; // 5 minutes buffer
        chrono::DateTime::from_timestamp(expiry, 0)
            .unwrap()
            .format("%Y-%m-%d %H:%M:%S")
            .to_string()
    }
}
