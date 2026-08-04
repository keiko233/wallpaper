/**
* | output |
* | --- |
* | "Sharpens angled and distant model or stage textures." |
*
* @param {Player_Settings_Texture_Filtering_DescriptionInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_texture_filtering_description: ((inputs?: Player_Settings_Texture_Filtering_DescriptionInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Player_Settings_Texture_Filtering_DescriptionInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Player_Settings_Texture_Filtering_DescriptionInputs = {};
