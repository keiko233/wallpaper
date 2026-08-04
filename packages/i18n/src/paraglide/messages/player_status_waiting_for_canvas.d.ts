/**
* | output |
* | --- |
* | "Waiting for canvas" |
*
* @param {Player_Status_Waiting_For_CanvasInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_status_waiting_for_canvas: ((inputs?: Player_Status_Waiting_For_CanvasInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Player_Status_Waiting_For_CanvasInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Player_Status_Waiting_For_CanvasInputs = {};
