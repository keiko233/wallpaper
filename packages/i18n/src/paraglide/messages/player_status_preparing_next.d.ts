/**
* | output |
* | --- |
* | "Preparing next" |
*
* @param {Player_Status_Preparing_NextInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_status_preparing_next: ((inputs?: Player_Status_Preparing_NextInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Player_Status_Preparing_NextInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Player_Status_Preparing_NextInputs = {};
