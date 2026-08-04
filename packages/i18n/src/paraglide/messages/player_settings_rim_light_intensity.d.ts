/**
* | output |
* | --- |
* | "Rim light intensity" |
*
* @param {Player_Settings_Rim_Light_IntensityInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_rim_light_intensity: ((inputs?: Player_Settings_Rim_Light_IntensityInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Player_Settings_Rim_Light_IntensityInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Player_Settings_Rim_Light_IntensityInputs = {};
