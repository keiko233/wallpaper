/**
* | output |
* | --- |
* | "Add resources before configuring playback and visuals." |
*
* @param {Player_Setup_DescriptionInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_setup_description: ((inputs?: Player_Setup_DescriptionInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Player_Setup_DescriptionInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Player_Setup_DescriptionInputs = {};
