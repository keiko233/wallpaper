/**
* | output |
* | --- |
* | "Move item {n} down" |
*
* @param {Player_Playlist_Move_DownInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_playlist_move_down: ((inputs: Player_Playlist_Move_DownInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Player_Playlist_Move_DownInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Player_Playlist_Move_DownInputs = {
    n: NonNullable<unknown>;
};
