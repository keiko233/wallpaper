/**
* | output |
* | --- |
* | "Contrast" |
*
* @param {Player_Settings_ContrastInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_contrast: ((inputs?: Player_Settings_ContrastInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Player_Settings_ContrastInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Player_Settings_ContrastInputs = {};
