/**
* | output |
* | --- |
* | "Enables the model's toon-ramp shading textures." |
*
* @param {Player_Settings_Toon_Maps_DescriptionInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_toon_maps_description: ((inputs?: Player_Settings_Toon_Maps_DescriptionInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Player_Settings_Toon_Maps_DescriptionInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Player_Settings_Toon_Maps_DescriptionInputs = {};
