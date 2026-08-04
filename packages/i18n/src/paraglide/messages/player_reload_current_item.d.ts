/**
* | output |
* | --- |
* | "Reload current item" |
*
* @param {Player_Reload_Current_ItemInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_reload_current_item: ((inputs?: Player_Reload_Current_ItemInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Player_Reload_Current_ItemInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Player_Reload_Current_ItemInputs = {};
