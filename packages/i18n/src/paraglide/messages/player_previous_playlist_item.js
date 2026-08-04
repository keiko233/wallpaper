/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Previous_Playlist_ItemInputs */

const en_player_previous_playlist_item = /** @type {(inputs: Player_Previous_Playlist_ItemInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Previous playlist item`)
};

const zh_player_previous_playlist_item = /** @type {(inputs: Player_Previous_Playlist_ItemInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`上一个播放列表项`)
};

/**
* | output |
* | --- |
* | "Previous playlist item" |
*
* @param {Player_Previous_Playlist_ItemInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_previous_playlist_item = /** @type {((inputs?: Player_Previous_Playlist_ItemInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Previous_Playlist_ItemInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_previous_playlist_item(inputs)
	return en_player_previous_playlist_item(inputs)
});