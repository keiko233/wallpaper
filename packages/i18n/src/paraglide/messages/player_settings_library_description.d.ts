/**
* | output |
* | --- |
* | "Browse and manage resources cached on this device." |
*
* @param {Player_Settings_Library_DescriptionInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_library_description: ((inputs?: Player_Settings_Library_DescriptionInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Player_Settings_Library_DescriptionInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Player_Settings_Library_DescriptionInputs = {};
