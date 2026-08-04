/**
* | output |
* | --- |
* | "Missing toon fallback" |
*
* @param {Player_Settings_Missing_Toon_FallbackInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_missing_toon_fallback: ((inputs?: Player_Settings_Missing_Toon_FallbackInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Player_Settings_Missing_Toon_FallbackInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Player_Settings_Missing_Toon_FallbackInputs = {};
