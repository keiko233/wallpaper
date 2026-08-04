/**
* | output |
* | --- |
* | "Antialiasing samples" |
*
* @param {Player_Settings_Antialiasing_SamplesInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_antialiasing_samples: ((inputs?: Player_Settings_Antialiasing_SamplesInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Player_Settings_Antialiasing_SamplesInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Player_Settings_Antialiasing_SamplesInputs = {};
