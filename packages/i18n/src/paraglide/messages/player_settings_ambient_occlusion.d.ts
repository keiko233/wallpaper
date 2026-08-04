/**
* | output |
* | --- |
* | "Ambient occlusion (SSAO)" |
*
* @param {Player_Settings_Ambient_OcclusionInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_ambient_occlusion: ((inputs?: Player_Settings_Ambient_OcclusionInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Player_Settings_Ambient_OcclusionInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Player_Settings_Ambient_OcclusionInputs = {};
