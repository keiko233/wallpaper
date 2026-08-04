/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ n: NonNullable<unknown> }} Player_Playlist_Move_DownInputs */

const en_player_playlist_move_down = /** @type {(inputs: Player_Playlist_Move_DownInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Move item ${i?.n} down`)
};

const zh_player_playlist_move_down = /** @type {(inputs: Player_Playlist_Move_DownInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`下移第 ${i?.n} 项`)
};

/**
* | output |
* | --- |
* | "Move item {n} down" |
*
* @param {Player_Playlist_Move_DownInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_playlist_move_down = /** @type {((inputs: Player_Playlist_Move_DownInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Playlist_Move_DownInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_playlist_move_down(inputs)
	return en_player_playlist_move_down(inputs)
});