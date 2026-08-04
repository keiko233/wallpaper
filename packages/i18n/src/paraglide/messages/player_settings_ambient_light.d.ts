/**
* | output |
* | --- |
* | "Ambient light" |
*
* @param {Player_Settings_Ambient_LightInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_ambient_light: ((inputs?: Player_Settings_Ambient_LightInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Player_Settings_Ambient_LightInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Player_Settings_Ambient_LightInputs = {};
