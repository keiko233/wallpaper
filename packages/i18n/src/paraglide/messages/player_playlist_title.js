/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Playlist_TitleInputs */

const en_player_playlist_title = /** @type {(inputs: Player_Playlist_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Playlist`)
};

const zh_player_playlist_title = /** @type {(inputs: Player_Playlist_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`播放列表`)
};

/**
* | output |
* | --- |
* | "Playlist" |
*
* @param {Player_Playlist_TitleInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_playlist_title = /** @type {((inputs?: Player_Playlist_TitleInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Playlist_TitleInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_playlist_title(inputs)
	return en_player_playlist_title(inputs)
});