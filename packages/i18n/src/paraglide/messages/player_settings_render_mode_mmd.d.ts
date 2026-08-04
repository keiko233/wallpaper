/**
* | output |
* | --- |
* | "MMD accurate" |
*
* @param {Player_Settings_Render_Mode_MmdInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_render_mode_mmd: ((inputs?: Player_Settings_Render_Mode_MmdInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Player_Settings_Render_Mode_MmdInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Player_Settings_Render_Mode_MmdInputs = {};
