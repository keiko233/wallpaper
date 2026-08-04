/**
* | output |
* | --- |
* | "Your playlist is empty" |
*
* @param {Web_Empty_Playlist_TitleInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const web_empty_playlist_title: ((inputs?: Web_Empty_Playlist_TitleInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Web_Empty_Playlist_TitleInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Web_Empty_Playlist_TitleInputs = {};
