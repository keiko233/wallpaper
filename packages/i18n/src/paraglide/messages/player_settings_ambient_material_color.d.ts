/**
* | output |
* | --- |
* | "Ambient material color" |
*
* @param {Player_Settings_Ambient_Material_ColorInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_ambient_material_color: ((inputs?: Player_Settings_Ambient_Material_ColorInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Player_Settings_Ambient_Material_ColorInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Player_Settings_Ambient_Material_ColorInputs = {};
