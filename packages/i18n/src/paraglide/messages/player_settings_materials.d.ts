/**
* | output |
* | --- |
* | "Materials" |
*
* @param {Player_Settings_MaterialsInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_materials: ((inputs?: Player_Settings_MaterialsInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Player_Settings_MaterialsInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Player_Settings_MaterialsInputs = {};
