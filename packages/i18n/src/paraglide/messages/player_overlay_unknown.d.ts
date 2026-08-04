/**
* | output |
* | --- |
* | "Unknown" |
*
* @param {Player_Overlay_UnknownInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_overlay_unknown: ((inputs?: Player_Overlay_UnknownInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Player_Overlay_UnknownInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Player_Overlay_UnknownInputs = {};
