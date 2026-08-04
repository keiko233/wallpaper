/**
* | output |
* | --- |
* | "Changing reflection settings reloads the current resources." |
*
* @param {Player_Settings_Reload_On_Reflection_ChangeInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_reload_on_reflection_change: ((inputs?: Player_Settings_Reload_On_Reflection_ChangeInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Player_Settings_Reload_On_Reflection_ChangeInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Player_Settings_Reload_On_Reflection_ChangeInputs = {};
