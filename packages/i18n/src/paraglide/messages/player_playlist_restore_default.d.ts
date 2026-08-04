/**
* | output |
* | --- |
* | "Restore default" |
*
* @param {Player_Playlist_Restore_DefaultInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_playlist_restore_default: ((inputs?: Player_Playlist_Restore_DefaultInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Player_Playlist_Restore_DefaultInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Player_Playlist_Restore_DefaultInputs = {};
