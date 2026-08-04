/**
* | output |
* | --- |
* | "Shadow softness" |
*
* @param {Player_Settings_Shadow_SoftnessInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_shadow_softness: ((inputs?: Player_Settings_Shadow_SoftnessInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Player_Settings_Shadow_SoftnessInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Player_Settings_Shadow_SoftnessInputs = {};
