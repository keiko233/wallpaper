/**
* | output |
* | --- |
* | "Keeps materials without a toon texture from becoming too dark." |
*
* @param {Player_Settings_Missing_Toon_Fallback_DescriptionInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_missing_toon_fallback_description: ((inputs?: Player_Settings_Missing_Toon_Fallback_DescriptionInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Player_Settings_Missing_Toon_Fallback_DescriptionInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Player_Settings_Missing_Toon_Fallback_DescriptionInputs = {};
