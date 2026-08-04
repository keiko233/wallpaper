/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Playlist_EditInputs */

const en_player_playlist_edit = /** @type {(inputs: Player_Playlist_EditInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Edit playlist`)
};

const zh_player_playlist_edit = /** @type {(inputs: Player_Playlist_EditInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`编辑播放列表`)
};

/**
* | output |
* | --- |
* | "Edit playlist" |
*
* @param {Player_Playlist_EditInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_playlist_edit = /** @type {((inputs?: Player_Playlist_EditInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Playlist_EditInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_playlist_edit(inputs)
	return en_player_playlist_edit(inputs)
});