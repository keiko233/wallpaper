/**
* | output |
* | --- |
* | "{count} draws" |
*
* @param {Player_Overlay_DrawsInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_overlay_draws: ((inputs: Player_Overlay_DrawsInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Player_Overlay_DrawsInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Player_Overlay_DrawsInputs = {
    count: NonNullable<unknown>;
};
