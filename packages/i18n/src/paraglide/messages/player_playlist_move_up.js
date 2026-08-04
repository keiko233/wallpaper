/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ n: NonNullable<unknown> }} Player_Playlist_Move_UpInputs */

const en_player_playlist_move_up = /** @type {(inputs: Player_Playlist_Move_UpInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Move item ${i?.n} up`)
};

const zh_player_playlist_move_up = /** @type {(inputs: Player_Playlist_Move_UpInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`上移第 ${i?.n} 项`)
};

/**
* | output |
* | --- |
* | "Move item {n} up" |
*
* @param {Player_Playlist_Move_UpInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_playlist_move_up = /** @type {((inputs: Player_Playlist_Move_UpInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Playlist_Move_UpInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_playlist_move_up(inputs)
	return en_player_playlist_move_up(inputs)
});