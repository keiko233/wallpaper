/**
* | output |
* | --- |
* | "Loading" |
*
* @param {Player_Status_LoadingInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_status_loading: ((inputs?: Player_Status_LoadingInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Player_Status_LoadingInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Player_Status_LoadingInputs = {};
