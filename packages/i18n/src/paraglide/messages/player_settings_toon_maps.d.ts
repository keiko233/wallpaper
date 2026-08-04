/**
* | output |
* | --- |
* | "Toon maps" |
*
* @param {Player_Settings_Toon_MapsInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_toon_maps: ((inputs?: Player_Settings_Toon_MapsInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Player_Settings_Toon_MapsInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Player_Settings_Toon_MapsInputs = {};
