/**
* | output |
* | --- |
* | "Uses the model's ambient color in the final diffuse color." |
*
* @param {Player_Settings_Ambient_Material_Color_DescriptionInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_ambient_material_color_description: ((inputs?: Player_Settings_Ambient_Material_Color_DescriptionInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Player_Settings_Ambient_Material_Color_DescriptionInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Player_Settings_Ambient_Material_Color_DescriptionInputs = {};
