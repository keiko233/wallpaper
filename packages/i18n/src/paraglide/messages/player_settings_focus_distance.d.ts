/**
* | output |
* | --- |
* | "Focus distance" |
*
* @param {Player_Settings_Focus_DistanceInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_focus_distance: ((inputs?: Player_Settings_Focus_DistanceInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Player_Settings_Focus_DistanceInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Player_Settings_Focus_DistanceInputs = {};
