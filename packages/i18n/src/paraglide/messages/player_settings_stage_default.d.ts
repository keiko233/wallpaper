/**
* | output |
* | --- |
* | "Stage default" |
*
* @param {Player_Settings_Stage_DefaultInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_stage_default: ((inputs?: Player_Settings_Stage_DefaultInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Player_Settings_Stage_DefaultInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Player_Settings_Stage_DefaultInputs = {};
