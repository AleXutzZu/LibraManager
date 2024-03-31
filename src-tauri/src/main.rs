// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command

use tauri::{Manager, State};
use libra_manager::database::DatabaseConnection;
use libra_manager::settings::Loader;

#[tauri::command]
fn get_library(settings_loader: State<Loader>) -> String {
    let settings = settings_loader.load().unwrap();
    settings.library_name
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            get_library
        ]).
        setup(|app| {
            let mut app_data_path = app.path_resolver().app_data_dir().unwrap();

            if !app_data_path.exists() {
                std::fs::create_dir_all(&app_data_path).unwrap();
            }

            app.manage(Loader::from(&app_data_path));

            app_data_path.push("database");

            app.manage(DatabaseConnection::from(app_data_path.to_str().unwrap()));

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
