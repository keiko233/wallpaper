/**
* | output |
* | --- |
* | "SSAO radius" |
*
* @param {Player_Settings_Ssao_RadiusInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_ssao_radius: ((inputs?: Player_Settings_Ssao_RadiusInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Player_Settings_Ssao_RadiusInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Player_Settings_Ssao_RadiusInputs = {};
