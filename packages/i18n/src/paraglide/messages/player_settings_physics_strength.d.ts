/**
* | output |
* | --- |
* | "Physics strength" |
*
* @param {Player_Settings_Physics_StrengthInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_physics_strength: ((inputs?: Player_Settings_Physics_StrengthInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Player_Settings_Physics_StrengthInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Player_Settings_Physics_StrengthInputs = {};
