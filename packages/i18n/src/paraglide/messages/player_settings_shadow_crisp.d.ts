/**
* | output |
* | --- |
* | "Crisp (PCF)" |
*
* @param {Player_Settings_Shadow_CrispInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_shadow_crisp: ((inputs?: Player_Settings_Shadow_CrispInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Player_Settings_Shadow_CrispInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Player_Settings_Shadow_CrispInputs = {};
