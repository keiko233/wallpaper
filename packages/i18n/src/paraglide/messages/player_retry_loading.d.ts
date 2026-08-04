/**
* | output |
* | --- |
* | "Retry loading" |
*
* @param {Player_Retry_LoadingInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_retry_loading: ((inputs?: Player_Retry_LoadingInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Player_Retry_LoadingInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Player_Retry_LoadingInputs = {};
