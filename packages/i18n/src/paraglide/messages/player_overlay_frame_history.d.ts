/**
* | output |
* | --- |
* | "Frame history" |
*
* @param {Player_Overlay_Frame_HistoryInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_overlay_frame_history: ((inputs?: Player_Overlay_Frame_HistoryInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Player_Overlay_Frame_HistoryInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Player_Overlay_Frame_HistoryInputs = {};
