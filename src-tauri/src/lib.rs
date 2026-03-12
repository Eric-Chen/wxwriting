pub mod commands;
pub mod db;
pub mod storage;
pub mod wx_api;

use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            let app_data_dir = app
                .path()
                .app_data_dir()
                .expect("failed to get app data dir");
            std::fs::create_dir_all(&app_data_dir).ok();

            let db_path = app_data_dir.join("data.db");
            let conn = db::init_db(&db_path).expect("failed to init database");
            app.manage(db::DbState(std::sync::Mutex::new(conn)));

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::greet,
            commands::article_cmds::create_article,
            commands::article_cmds::get_article,
            commands::article_cmds::update_article,
            commands::article_cmds::delete_article,
            commands::article_cmds::list_articles,
            commands::category_cmds::create_category,
            commands::category_cmds::update_category,
            commands::category_cmds::delete_category,
            commands::category_cmds::list_categories,
            commands::tag_cmds::create_tag,
            commands::tag_cmds::delete_tag,
            commands::tag_cmds::list_tags,
            commands::tag_cmds::add_article_tag,
            commands::tag_cmds::remove_article_tag,
            commands::tag_cmds::get_article_tags,
            commands::image_cmds::create_image,
            commands::image_cmds::get_image,
            commands::image_cmds::delete_image,
            commands::image_cmds::list_images,
            commands::wx_account_cmds::save_wx_account,
            commands::wx_account_cmds::get_wx_account,
            commands::wx_api_cmds::refresh_access_token,
            commands::wx_api_cmds::get_valid_access_token,
            commands::wx_api_cmds::upload_wx_image,
            commands::wx_api_cmds::test_wx_connection,
            commands::wx_api_cmds::publish_article_to_wx,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
