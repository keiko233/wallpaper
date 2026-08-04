/**
* | output |
* | --- |
* | "Bullet matches how MMD itself simulates skirts and hair, and honors the model's joint springs. Havok loads faster but drops those settings. Changing the engi..." |
*
* @param {Player_Settings_Physics_Engine_DescriptionInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_physics_engine_description: ((inputs?: Player_Settings_Physics_Engine_DescriptionInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Player_Settings_Physics_Engine_DescriptionInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Player_Settings_Physics_Engine_DescriptionInputs = {};
