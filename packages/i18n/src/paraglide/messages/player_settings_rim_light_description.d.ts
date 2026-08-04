/**
* | output |
* | --- |
* | "Faint cool back light that separates the model from the background." |
*
* @param {Player_Settings_Rim_Light_DescriptionInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_rim_light_description: ((inputs?: Player_Settings_Rim_Light_DescriptionInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Player_Settings_Rim_Light_DescriptionInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Player_Settings_Rim_Light_DescriptionInputs = {};
