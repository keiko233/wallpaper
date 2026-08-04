/**
* | output |
* | --- |
* | "High" |
*
* @param {Player_Settings_Quality_HighInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_quality_high: ((inputs?: Player_Settings_Quality_HighInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Player_Settings_Quality_HighInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Player_Settings_Quality_HighInputs = {};
