/**
* | output |
* | --- |
* | "Current combination" |
*
* @param {Player_Settings_Current_CombinationInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_current_combination: ((inputs?: Player_Settings_Current_CombinationInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Player_Settings_Current_CombinationInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Player_Settings_Current_CombinationInputs = {};
