/**
* | output |
* | --- |
* | "Rendering mode" |
*
* @param {Player_Settings_Rendering_ModeInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_rendering_mode: ((inputs?: Player_Settings_Rendering_ModeInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Player_Settings_Rendering_ModeInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Player_Settings_Rendering_ModeInputs = {};
