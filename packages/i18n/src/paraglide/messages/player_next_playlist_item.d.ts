/**
* | output |
* | --- |
* | "Next playlist item" |
*
* @param {Player_Next_Playlist_ItemInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_next_playlist_item: ((inputs?: Player_Next_Playlist_ItemInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Player_Next_Playlist_ItemInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Player_Next_Playlist_ItemInputs = {};
