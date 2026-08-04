/**
* | output |
* | --- |
* | "Physics engine" |
*
* @param {Player_Settings_Physics_EngineInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_physics_engine: ((inputs?: Player_Settings_Physics_EngineInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Player_Settings_Physics_EngineInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Player_Settings_Physics_EngineInputs = {};
