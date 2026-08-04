/**
* | output |
* | --- |
* | "Camera-focused blur inspired by ikBokeh and PowerDOF." |
*
* @param {Player_Settings_Depth_Of_Field_DescriptionInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_depth_of_field_description: ((inputs?: Player_Settings_Depth_Of_Field_DescriptionInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Player_Settings_Depth_Of_Field_DescriptionInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Player_Settings_Depth_Of_Field_DescriptionInputs = {};
