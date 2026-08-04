/**
* | output |
* | --- |
* | "Aperture" |
*
* @param {Player_Settings_ApertureInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_aperture: ((inputs?: Player_Settings_ApertureInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Player_Settings_ApertureInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Player_Settings_ApertureInputs = {};
