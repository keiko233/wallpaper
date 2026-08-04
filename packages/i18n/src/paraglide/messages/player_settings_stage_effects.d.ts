/**
* | output |
* | --- |
* | "Stage effects" |
*
* @param {Player_Settings_Stage_EffectsInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_stage_effects: ((inputs?: Player_Settings_Stage_EffectsInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Player_Settings_Stage_EffectsInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Player_Settings_Stage_EffectsInputs = {};
