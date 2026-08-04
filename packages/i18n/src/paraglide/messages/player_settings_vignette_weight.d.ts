/**
* | output |
* | --- |
* | "Vignette weight" |
*
* @param {Player_Settings_Vignette_WeightInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_vignette_weight: ((inputs?: Player_Settings_Vignette_WeightInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Player_Settings_Vignette_WeightInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Player_Settings_Vignette_WeightInputs = {};
