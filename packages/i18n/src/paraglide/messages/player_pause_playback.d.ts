/**
* | output |
* | --- |
* | "Pause playback" |
*
* @param {Player_Pause_PlaybackInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_pause_playback: ((inputs?: Player_Pause_PlaybackInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Player_Pause_PlaybackInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Player_Pause_PlaybackInputs = {};
