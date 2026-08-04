/**
* | output |
* | --- |
* | "Renders stage-profile and WorkingFloor mirrors. This can be expensive on the GPU." |
*
* @param {Player_Settings_Planar_Reflections_DescriptionInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_planar_reflections_description: ((inputs?: Player_Settings_Planar_Reflections_DescriptionInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Player_Settings_Planar_Reflections_DescriptionInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Player_Settings_Planar_Reflections_DescriptionInputs = {};
