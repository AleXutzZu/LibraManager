import {invoke} from "@tauri-apps/api/tauri";

export type Settings = {
    libraryName: string,
    cameraDeviceId: string | null,
}

class SettingsProvider {

    public async getCurrentSettings(): Promise<Settings> {
        return await invoke("get_settings") as Settings;
    }

    public async saveCurrentSettings(settings: Settings) {
        await invoke("save_settings", {settings});
    }
}


export const settingsProvider = new SettingsProvider();
