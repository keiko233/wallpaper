/**
* | output |
* | --- |
* | "MME effects" |
*
* @param {Player_Settings_Mme_EffectsInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_mme_effects: ((inputs?: Player_Settings_Mme_EffectsInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Player_Settings_Mme_EffectsInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Player_Settings_Mme_EffectsInputs = {};
