/**
* | output |
* | --- |
* | "Rim light" |
*
* @param {Player_Settings_Rim_LightInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_rim_light: ((inputs?: Player_Settings_Rim_LightInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Player_Settings_Rim_LightInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Player_Settings_Rim_LightInputs = {};
