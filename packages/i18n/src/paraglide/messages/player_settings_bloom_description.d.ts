/**
* | output |
* | --- |
* | "Soft glow around bright highlights, similar to AutoLuminous." |
*
* @param {Player_Settings_Bloom_DescriptionInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_bloom_description: ((inputs?: Player_Settings_Bloom_DescriptionInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Player_Settings_Bloom_DescriptionInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Player_Settings_Bloom_DescriptionInputs = {};
