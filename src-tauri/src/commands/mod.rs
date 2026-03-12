pub mod article_cmds;
pub mod category_cmds;
pub mod image_cmds;
pub mod tag_cmds;
pub mod wx_account_cmds;

#[tauri::command]
pub fn greet(name: &str) -> String {
    format!("Hello, {}! Welcome to wx-tools.", name)
}
