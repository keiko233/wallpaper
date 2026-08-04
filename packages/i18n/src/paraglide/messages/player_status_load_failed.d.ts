/**
* | output |
* | --- |
* | "Load failed" |
*
* @param {Player_Status_Load_FailedInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_status_load_failed: ((inputs?: Player_Status_Load_FailedInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Player_Status_Load_FailedInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Player_Status_Load_FailedInputs = {};
