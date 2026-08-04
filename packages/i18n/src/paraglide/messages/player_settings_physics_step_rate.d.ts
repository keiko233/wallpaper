/**
* | output |
* | --- |
* | "Physics step rate" |
*
* @param {Player_Settings_Physics_Step_RateInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_physics_step_rate: ((inputs?: Player_Settings_Physics_Step_RateInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Player_Settings_Physics_Step_RateInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Player_Settings_Physics_Step_RateInputs = {};
