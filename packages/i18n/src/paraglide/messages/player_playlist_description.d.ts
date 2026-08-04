/**
* | output |
* | --- |
* | "Combine any model, motion, stage, and skybox. Audio and camera follow the selected motion. The list loops continuously and is saved automatically on this dev..." |
*
* @param {Player_Playlist_DescriptionInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_playlist_description: ((inputs?: Player_Playlist_DescriptionInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Player_Playlist_DescriptionInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Player_Playlist_DescriptionInputs = {};
