/**
* | output |
* | --- |
* | "Open player setup below, then add at least one model, motion, and stage. Everything you add is cached only on this device." |
*
* @param {Web_Empty_Playlist_DescriptionInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const web_empty_playlist_description: ((inputs?: Web_Empty_Playlist_DescriptionInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Web_Empty_Playlist_DescriptionInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Web_Empty_Playlist_DescriptionInputs = {};
