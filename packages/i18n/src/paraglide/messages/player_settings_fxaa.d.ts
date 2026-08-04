/**
* | output |
* | --- |
* | "FXAA" |
*
* @param {Player_Settings_FxaaInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_fxaa: ((inputs?: Player_Settings_FxaaInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Player_Settings_FxaaInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Player_Settings_FxaaInputs = {};
