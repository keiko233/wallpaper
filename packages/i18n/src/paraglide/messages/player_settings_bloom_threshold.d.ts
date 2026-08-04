/**
* | output |
* | --- |
* | "Bloom threshold" |
*
* @param {Player_Settings_Bloom_ThresholdInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_bloom_threshold: ((inputs?: Player_Settings_Bloom_ThresholdInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Player_Settings_Bloom_ThresholdInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Player_Settings_Bloom_ThresholdInputs = {};
