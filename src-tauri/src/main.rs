// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command

//TODO: Modify this to query the DB obviously
#[tauri::command]
fn get_library() -> String {
    "Librarie".to_string()
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            get_library
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}