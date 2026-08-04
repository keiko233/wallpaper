/**
* | output |
* | --- |
* | "Soft (PCSS)" |
*
* @param {Player_Settings_Shadow_SoftInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_shadow_soft: ((inputs?: Player_Settings_Shadow_SoftInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Player_Settings_Shadow_SoftInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Player_Settings_Shadow_SoftInputs = {};
