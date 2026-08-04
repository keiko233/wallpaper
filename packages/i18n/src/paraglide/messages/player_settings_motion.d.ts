/**
* | output |
* | --- |
* | "Motion" |
*
* @param {Player_Settings_MotionInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_motion: ((inputs?: Player_Settings_MotionInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Player_Settings_MotionInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Player_Settings_MotionInputs = {};
