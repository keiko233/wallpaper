/**
* | output |
* | --- |
* | "Supersampling" |
*
* @param {Player_Settings_SupersamplingInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_supersampling: ((inputs?: Player_Settings_SupersamplingInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Player_Settings_SupersamplingInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Player_Settings_SupersamplingInputs = {};
