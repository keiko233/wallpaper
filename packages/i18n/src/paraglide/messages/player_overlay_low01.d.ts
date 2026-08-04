/**
* | output |
* | --- |
* | "0.1%" |
*
* @param {Player_Overlay_Low01Inputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_overlay_low01: ((inputs?: Player_Overlay_Low01Inputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Player_Overlay_Low01Inputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Player_Overlay_Low01Inputs = {};
