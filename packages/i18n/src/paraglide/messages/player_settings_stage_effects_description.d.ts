/**
* | output |
* | --- |
* | "Applies the stage's built-in material, lighting, emissive, and bloom tuning." |
*
* @param {Player_Settings_Stage_Effects_DescriptionInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_stage_effects_description: ((inputs?: Player_Settings_Stage_Effects_DescriptionInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Player_Settings_Stage_Effects_DescriptionInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Player_Settings_Stage_Effects_DescriptionInputs = {};
