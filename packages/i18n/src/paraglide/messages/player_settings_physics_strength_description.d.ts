/**
* | output |
* | --- |
* | "Stiffness of the model's joints; below 1 makes hair and skirts softer, above 1 stiffer. Changing this value reloads the current resources." |
*
* @param {Player_Settings_Physics_Strength_DescriptionInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_physics_strength_description: ((inputs?: Player_Settings_Physics_Strength_DescriptionInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Player_Settings_Physics_Strength_DescriptionInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Player_Settings_Physics_Strength_DescriptionInputs = {};
