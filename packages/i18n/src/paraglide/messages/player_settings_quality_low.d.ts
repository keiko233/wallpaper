/**
* | output |
* | --- |
* | "Low" |
*
* @param {Player_Settings_Quality_LowInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_quality_low: ((inputs?: Player_Settings_Quality_LowInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Player_Settings_Quality_LowInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Player_Settings_Quality_LowInputs = {};
