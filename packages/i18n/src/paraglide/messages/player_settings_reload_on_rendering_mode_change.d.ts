/**
* | output |
* | --- |
* | "Changing this option reloads the current model." |
*
* @param {Player_Settings_Reload_On_Rendering_Mode_ChangeInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_reload_on_rendering_mode_change: ((inputs?: Player_Settings_Reload_On_Rendering_Mode_ChangeInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Player_Settings_Reload_On_Rendering_Mode_ChangeInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Player_Settings_Reload_On_Rendering_Mode_ChangeInputs = {};
