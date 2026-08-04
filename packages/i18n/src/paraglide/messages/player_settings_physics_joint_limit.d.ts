/**
* | output |
* | --- |
* | "Physics joint limit" |
*
* @param {Player_Settings_Physics_Joint_LimitInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_physics_joint_limit: ((inputs?: Player_Settings_Physics_Joint_LimitInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Player_Settings_Physics_Joint_LimitInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Player_Settings_Physics_Joint_LimitInputs = {};
