/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Next_Playlist_ItemInputs */

const en_player_next_playlist_item = /** @type {(inputs: Player_Next_Playlist_ItemInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Next playlist item`)
};

const zh_player_next_playlist_item = /** @type {(inputs: Player_Next_Playlist_ItemInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`下一个播放列表项`)
};

/**
* | output |
* | --- |
* | "Next playlist item" |
*
* @param {Player_Next_Playlist_ItemInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_next_playlist_item = /** @type {((inputs?: Player_Next_Playlist_ItemInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Next_Playlist_ItemInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_next_playlist_item(inputs)
	return en_player_next_playlist_item(inputs)
});