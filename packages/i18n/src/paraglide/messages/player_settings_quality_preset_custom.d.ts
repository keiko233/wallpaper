/**
* | output |
* | --- |
* | "Custom" |
*
* @param {Player_Settings_Quality_Preset_CustomInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_quality_preset_custom: ((inputs?: Player_Settings_Quality_Preset_CustomInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Player_Settings_Quality_Preset_CustomInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Player_Settings_Quality_Preset_CustomInputs = {};
