/**
* | output |
* | --- |
* | "Key light color" |
*
* @param {Player_Settings_Key_Light_ColorInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_key_light_color: ((inputs?: Player_Settings_Key_Light_ColorInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Player_Settings_Key_Light_ColorInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Player_Settings_Key_Light_ColorInputs = {};
