/**
* | output |
* | --- |
* | "1% LOW" |
*
* @param {Player_Overlay_Low1Inputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_overlay_low1: ((inputs?: Player_Overlay_Low1Inputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Player_Overlay_Low1Inputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Player_Overlay_Low1Inputs = {};
