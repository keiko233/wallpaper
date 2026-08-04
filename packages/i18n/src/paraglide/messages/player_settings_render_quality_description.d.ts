/**
* | output |
* | --- |
* | "Presets balance visual fidelity against GPU cost. Advanced options tune each effect individually." |
*
* @param {Player_Settings_Render_Quality_DescriptionInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_render_quality_description: ((inputs?: Player_Settings_Render_Quality_DescriptionInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Player_Settings_Render_Quality_DescriptionInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Player_Settings_Render_Quality_DescriptionInputs = {};
