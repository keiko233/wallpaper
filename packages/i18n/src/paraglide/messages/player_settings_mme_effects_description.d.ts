/**
* | output |
* | --- |
* | "Browser-native versions of common MME post effects." |
*
* @param {Player_Settings_Mme_Effects_DescriptionInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_mme_effects_description: ((inputs?: Player_Settings_Mme_Effects_DescriptionInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Player_Settings_Mme_Effects_DescriptionInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Player_Settings_Mme_Effects_DescriptionInputs = {};
