/**
* | output |
* | --- |
* | "Render" |
*
* @param {Player_Settings_Tab_RenderInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_tab_render: ((inputs?: Player_Settings_Tab_RenderInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Player_Settings_Tab_RenderInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Player_Settings_Tab_RenderInputs = {};
