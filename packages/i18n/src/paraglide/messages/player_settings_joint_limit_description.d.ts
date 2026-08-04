/**
* | output |
* | --- |
* | "Lower joint limits keep the model's original hair and skirt motion; higher values improve stability on broken joints. Changing SSAO, SSR, physics or this val..." |
*
* @param {Player_Settings_Joint_Limit_DescriptionInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_joint_limit_description: ((inputs?: Player_Settings_Joint_Limit_DescriptionInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Player_Settings_Joint_Limit_DescriptionInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Player_Settings_Joint_Limit_DescriptionInputs = {};
