/**
* | output |
* | --- |
* | "No resource manager is available." |
*
* @param {Player_No_Resource_ManagerInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_no_resource_manager: ((inputs?: Player_No_Resource_ManagerInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Player_No_Resource_ManagerInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Player_No_Resource_ManagerInputs = {};
