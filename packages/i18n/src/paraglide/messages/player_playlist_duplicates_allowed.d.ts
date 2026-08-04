/**
* | output |
* | --- |
* | "Duplicate combinations are allowed." |
*
* @param {Player_Playlist_Duplicates_AllowedInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_playlist_duplicates_allowed: ((inputs?: Player_Playlist_Duplicates_AllowedInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Player_Playlist_Duplicates_AllowedInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Player_Playlist_Duplicates_AllowedInputs = {};
