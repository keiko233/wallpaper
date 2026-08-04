/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ n: NonNullable<unknown> }} Player_Playlist_Play_ItemInputs */

const en_player_playlist_play_item = /** @type {(inputs: Player_Playlist_Play_ItemInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Play item ${i?.n}`)
};

const zh_player_playlist_play_item = /** @type {(inputs: Player_Playlist_Play_ItemInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`播放第 ${i?.n} 项`)
};

/**
* | output |
* | --- |
* | "Play item {n}" |
*
* @param {Player_Playlist_Play_ItemInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_playlist_play_item = /** @type {((inputs: Player_Playlist_Play_ItemInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Playlist_Play_ItemInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_playlist_play_item(inputs)
	return en_player_playlist_play_item(inputs)
});