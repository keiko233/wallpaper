/**
* | output |
* | --- |
* | "Bloom" |
*
* @param {Player_Settings_BloomInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_bloom: ((inputs?: Player_Settings_BloomInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Player_Settings_BloomInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Player_Settings_BloomInputs = {};
