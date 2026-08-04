/**
* | output |
* | --- |
* | "Previous playlist item" |
*
* @param {Player_Previous_Playlist_ItemInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_previous_playlist_item: ((inputs?: Player_Previous_Playlist_ItemInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Player_Previous_Playlist_ItemInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Player_Previous_Playlist_ItemInputs = {};
