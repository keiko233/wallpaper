/**
* | output |
* | --- |
* | "Waiting for the first rendered frames…" |
*
* @param {Player_Settings_Waiting_For_FramesInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_waiting_for_frames: ((inputs?: Player_Settings_Waiting_For_FramesInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Player_Settings_Waiting_For_FramesInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Player_Settings_Waiting_For_FramesInputs = {};
