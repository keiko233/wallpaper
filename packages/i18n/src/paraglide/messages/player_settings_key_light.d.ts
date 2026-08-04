/**
* | output |
* | --- |
* | "Key light" |
*
* @param {Player_Settings_Key_LightInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_key_light: ((inputs?: Player_Settings_Key_LightInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Player_Settings_Key_LightInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Player_Settings_Key_LightInputs = {};
