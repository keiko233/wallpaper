/**
* | output |
* | --- |
* | "Add combination" |
*
* @param {Player_Playlist_Add_CombinationInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_playlist_add_combination: ((inputs?: Player_Playlist_Add_CombinationInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Player_Playlist_Add_CombinationInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Player_Playlist_Add_CombinationInputs = {};
