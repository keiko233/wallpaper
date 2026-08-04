/**
* | output |
* | --- |
* | "Fill light" |
*
* @param {Player_Settings_Fill_LightInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_fill_light: ((inputs?: Player_Settings_Fill_LightInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Player_Settings_Fill_LightInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Player_Settings_Fill_LightInputs = {};
