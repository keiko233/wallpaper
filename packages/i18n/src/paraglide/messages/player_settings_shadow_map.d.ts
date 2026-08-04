/**
* | output |
* | --- |
* | "Shadow map" |
*
* @param {Player_Settings_Shadow_MapInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_shadow_map: ((inputs?: Player_Settings_Shadow_MapInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Player_Settings_Shadow_MapInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Player_Settings_Shadow_MapInputs = {};
