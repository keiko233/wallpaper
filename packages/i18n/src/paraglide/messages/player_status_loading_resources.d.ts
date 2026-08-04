/**
* | output |
* | --- |
* | "Loading resources" |
*
* @param {Player_Status_Loading_ResourcesInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_status_loading_resources: ((inputs?: Player_Status_Loading_ResourcesInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Player_Status_Loading_ResourcesInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Player_Status_Loading_ResourcesInputs = {};
