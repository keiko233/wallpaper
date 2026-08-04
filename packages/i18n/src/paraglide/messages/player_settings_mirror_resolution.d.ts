/**
* | output |
* | --- |
* | "Mirror resolution" |
*
* @param {Player_Settings_Mirror_ResolutionInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_mirror_resolution: ((inputs?: Player_Settings_Mirror_ResolutionInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Player_Settings_Mirror_ResolutionInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Player_Settings_Mirror_ResolutionInputs = {};
