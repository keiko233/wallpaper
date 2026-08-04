/**
* | output |
* | --- |
* | "Shadow opacity" |
*
* @param {Player_Settings_Shadow_OpacityInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_shadow_opacity: ((inputs?: Player_Settings_Shadow_OpacityInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Player_Settings_Shadow_OpacityInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Player_Settings_Shadow_OpacityInputs = {};
