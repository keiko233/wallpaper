/**
* | output |
* | --- |
* | "Ready" |
*
* @param {Player_Status_ReadyInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_status_ready: ((inputs?: Player_Status_ReadyInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Player_Status_ReadyInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Player_Status_ReadyInputs = {};
