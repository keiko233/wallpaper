/**
* | output |
* | --- |
* | "Content" |
*
* @param {Player_Settings_Tab_ContentInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_tab_content: ((inputs?: Player_Settings_Tab_ContentInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Player_Settings_Tab_ContentInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Player_Settings_Tab_ContentInputs = {};
