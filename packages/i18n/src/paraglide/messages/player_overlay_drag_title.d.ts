/**
* | output |
* | --- |
* | "Drag to reposition" |
*
* @param {Player_Overlay_Drag_TitleInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_overlay_drag_title: ((inputs?: Player_Overlay_Drag_TitleInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Player_Overlay_Drag_TitleInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Player_Overlay_Drag_TitleInputs = {};
