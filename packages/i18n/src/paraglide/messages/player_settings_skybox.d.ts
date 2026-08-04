/**
* | output |
* | --- |
* | "Skybox" |
*
* @param {Player_Settings_SkyboxInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_skybox: ((inputs?: Player_Settings_SkyboxInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Player_Settings_SkyboxInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Player_Settings_SkyboxInputs = {};
