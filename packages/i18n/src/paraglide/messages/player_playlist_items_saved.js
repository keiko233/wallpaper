/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown> }} Player_Playlist_Items_SavedInputs */

const en_player_playlist_items_saved = /** @type {(inputs: Player_Playlist_Items_SavedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} items · saved automatically`)
};

const zh_player_playlist_items_saved = /** @type {(inputs: Player_Playlist_Items_SavedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} 项 · 自动保存`)
};

/**
* | output |
* | --- |
* | "{count} items · saved automatically" |
*
* @param {Player_Playlist_Items_SavedInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_playlist_items_saved = /** @type {((inputs: Player_Playlist_Items_SavedInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Playlist_Items_SavedInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_playlist_items_saved(inputs)
	return en_player_playlist_items_saved(inputs)
});