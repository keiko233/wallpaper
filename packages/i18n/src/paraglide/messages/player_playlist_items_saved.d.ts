/**
* | output |
* | --- |
* | "{count} items · saved automatically" |
*
* @param {Player_Playlist_Items_SavedInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_playlist_items_saved: ((inputs: Player_Playlist_Items_SavedInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Player_Playlist_Items_SavedInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Player_Playlist_Items_SavedInputs = {
    count: NonNullable<unknown>;
};
