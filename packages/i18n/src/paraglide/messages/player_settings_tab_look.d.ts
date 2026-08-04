/**
* | output |
* | --- |
* | "Look" |
*
* @param {Player_Settings_Tab_LookInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_tab_look: ((inputs?: Player_Settings_Tab_LookInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Player_Settings_Tab_LookInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Player_Settings_Tab_LookInputs = {};
