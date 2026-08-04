/**
* | output |
* | --- |
* | "Texture filtering" |
*
* @param {Player_Settings_Texture_FilteringInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_texture_filtering: ((inputs?: Player_Settings_Texture_FilteringInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Player_Settings_Texture_FilteringInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Player_Settings_Texture_FilteringInputs = {};
