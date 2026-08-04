/**
* | output |
* | --- |
* | "Enables sphere maps used for metallic and glossy highlights." |
*
* @param {Player_Settings_Sphere_Maps_DescriptionInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_sphere_maps_description: ((inputs?: Player_Settings_Sphere_Maps_DescriptionInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Player_Settings_Sphere_Maps_DescriptionInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Player_Settings_Sphere_Maps_DescriptionInputs = {};
