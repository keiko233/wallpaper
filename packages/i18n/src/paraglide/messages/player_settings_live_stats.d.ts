/**
* | output |
* | --- |
* | "Live stats" |
*
* @param {Player_Settings_Live_StatsInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_live_stats: ((inputs?: Player_Settings_Live_StatsInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Player_Settings_Live_StatsInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Player_Settings_Live_StatsInputs = {};
