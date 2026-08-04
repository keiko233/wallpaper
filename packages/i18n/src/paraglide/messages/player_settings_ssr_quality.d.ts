/**
* | output |
* | --- |
* | "SSR quality" |
*
* @param {Player_Settings_Ssr_QualityInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_ssr_quality: ((inputs?: Player_Settings_Ssr_QualityInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Player_Settings_Ssr_QualityInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Player_Settings_Ssr_QualityInputs = {};
