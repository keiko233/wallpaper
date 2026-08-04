/**
* | output |
* | --- |
* | "Havok (lighter)" |
*
* @param {Player_Settings_Physics_HavokInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_physics_havok: ((inputs?: Player_Settings_Physics_HavokInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Player_Settings_Physics_HavokInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Player_Settings_Physics_HavokInputs = {};
