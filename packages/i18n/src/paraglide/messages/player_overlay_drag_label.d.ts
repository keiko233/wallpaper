/**
* | output |
* | --- |
* | "Drag performance overlay" |
*
* @param {Player_Overlay_Drag_LabelInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_overlay_drag_label: ((inputs?: Player_Overlay_Drag_LabelInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Player_Overlay_Drag_LabelInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Player_Overlay_Drag_LabelInputs = {};
