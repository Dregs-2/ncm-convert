// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
mod ncm;

#[tauri::command]
fn convert(input: String, output: String) -> String {
    match ncm::unboxing(input.clone(), output) {
        Ok(_) => format!("OK: {}", input),
        Err(error) => error.to_string(),
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![convert])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
