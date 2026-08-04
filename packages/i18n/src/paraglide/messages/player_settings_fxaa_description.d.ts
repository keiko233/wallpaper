/**
* | output |
* | --- |
* | "Fast post-process filter that smooths remaining jagged edges after MSAA." |
*
* @param {Player_Settings_Fxaa_DescriptionInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_fxaa_description: ((inputs?: Player_Settings_Fxaa_DescriptionInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Player_Settings_Fxaa_DescriptionInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Player_Settings_Fxaa_DescriptionInputs = {};
