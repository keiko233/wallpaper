/**
* | output |
* | --- |
* | "Motion for item {n}" |
*
* @param {Player_Playlist_Motion_For_ItemInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_playlist_motion_for_item: ((inputs: Player_Playlist_Motion_For_ItemInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Player_Playlist_Motion_For_ItemInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Player_Playlist_Motion_For_ItemInputs = {
    n: NonNullable<unknown>;
};
