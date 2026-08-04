/**
* | output |
* | --- |
* | "Balanced" |
*
* @param {Player_Settings_Render_Mode_BalancedInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_render_mode_balanced: ((inputs?: Player_Settings_Render_Mode_BalancedInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Player_Settings_Render_Mode_BalancedInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Player_Settings_Render_Mode_BalancedInputs = {};
