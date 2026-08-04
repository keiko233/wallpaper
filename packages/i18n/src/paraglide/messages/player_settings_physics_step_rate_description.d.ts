/**
* | output |
* | --- |
* | "Higher rates simulate hair and skirts more smoothly at a CPU cost." |
*
* @param {Player_Settings_Physics_Step_Rate_DescriptionInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_physics_step_rate_description: ((inputs?: Player_Settings_Physics_Step_Rate_DescriptionInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Player_Settings_Physics_Step_Rate_DescriptionInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Player_Settings_Physics_Step_Rate_DescriptionInputs = {};
