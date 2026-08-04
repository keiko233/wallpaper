/**
* | output |
* | --- |
* | "Appearance" |
*
* @param {Player_Settings_AppearanceInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_appearance: ((inputs?: Player_Settings_AppearanceInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Player_Settings_AppearanceInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Player_Settings_AppearanceInputs = {};
