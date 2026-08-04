/**
* | output |
* | --- |
* | "Playlist" |
*
* @param {Player_Settings_PlaylistInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_playlist: ((inputs?: Player_Settings_PlaylistInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Player_Settings_PlaylistInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Player_Settings_PlaylistInputs = {};
