/**
* | output |
* | --- |
* | "Screen-space reflections on glossy surfaces. Experimental with MMD toon materials; best on reflective stages." |
*
* @param {Player_Settings_Screen_Space_Reflections_DescriptionInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_screen_space_reflections_description: ((inputs?: Player_Settings_Screen_Space_Reflections_DescriptionInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Player_Settings_Screen_Space_Reflections_DescriptionInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Player_Settings_Screen_Space_Reflections_DescriptionInputs = {};
