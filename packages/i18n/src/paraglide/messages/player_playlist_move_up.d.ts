/**
* | output |
* | --- |
* | "Move item {n} up" |
*
* @param {Player_Playlist_Move_UpInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_playlist_move_up: ((inputs: Player_Playlist_Move_UpInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Player_Playlist_Move_UpInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Player_Playlist_Move_UpInputs = {
    n: NonNullable<unknown>;
};
