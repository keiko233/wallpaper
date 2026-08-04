/**
* | output |
* | --- |
* | "Open MMD settings" |
*
* @param {Player_Open_Mmd_SettingsInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_open_mmd_settings: ((inputs?: Player_Open_Mmd_SettingsInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Player_Open_Mmd_SettingsInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Player_Open_Mmd_SettingsInputs = {};
