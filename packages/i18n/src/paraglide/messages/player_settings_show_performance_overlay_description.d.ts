/**
* | output |
* | --- |
* | "Shows FPS, frame time, 1% lows and GPU stats over the wallpaper." |
*
* @param {Player_Settings_Show_Performance_Overlay_DescriptionInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_show_performance_overlay_description: ((inputs?: Player_Settings_Show_Performance_Overlay_DescriptionInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Player_Settings_Show_Performance_Overlay_DescriptionInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Player_Settings_Show_Performance_Overlay_DescriptionInputs = {};
