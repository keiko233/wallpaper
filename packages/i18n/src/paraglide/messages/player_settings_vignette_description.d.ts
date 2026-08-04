/**
* | output |
* | --- |
* | "Darkens the frame edges to draw attention to the model." |
*
* @param {Player_Settings_Vignette_DescriptionInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_vignette_description: ((inputs?: Player_Settings_Vignette_DescriptionInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Player_Settings_Vignette_DescriptionInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Player_Settings_Vignette_DescriptionInputs = {};
