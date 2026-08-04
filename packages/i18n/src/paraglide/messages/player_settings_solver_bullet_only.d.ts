/**
* | output |
* | --- |
* | "Only available with the Bullet engine." |
*
* @param {Player_Settings_Solver_Bullet_OnlyInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_solver_bullet_only: ((inputs?: Player_Settings_Solver_Bullet_OnlyInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Player_Settings_Solver_Bullet_OnlyInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Player_Settings_Solver_Bullet_OnlyInputs = {};
