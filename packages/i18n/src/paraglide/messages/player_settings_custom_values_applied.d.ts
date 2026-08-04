/**
* | output |
* | --- |
* | "Custom values are currently applied." |
*
* @param {Player_Settings_Custom_Values_AppliedInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_custom_values_applied: ((inputs?: Player_Settings_Custom_Values_AppliedInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Player_Settings_Custom_Values_AppliedInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Player_Settings_Custom_Values_AppliedInputs = {};
