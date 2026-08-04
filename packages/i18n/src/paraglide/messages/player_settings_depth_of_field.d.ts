/**
* | output |
* | --- |
* | "Depth of field" |
*
* @param {Player_Settings_Depth_Of_FieldInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_depth_of_field: ((inputs?: Player_Settings_Depth_Of_FieldInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Player_Settings_Depth_Of_FieldInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Player_Settings_Depth_Of_FieldInputs = {};
