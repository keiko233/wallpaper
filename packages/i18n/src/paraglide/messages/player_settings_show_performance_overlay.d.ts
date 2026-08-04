/**
* | output |
* | --- |
* | "Show performance overlay" |
*
* @param {Player_Settings_Show_Performance_OverlayInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_show_performance_overlay: ((inputs?: Player_Settings_Show_Performance_OverlayInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Player_Settings_Show_Performance_OverlayInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Player_Settings_Show_Performance_OverlayInputs = {};
