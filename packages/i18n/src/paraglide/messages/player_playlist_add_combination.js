/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Playlist_Add_CombinationInputs */

const en_player_playlist_add_combination = /** @type {(inputs: Player_Playlist_Add_CombinationInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Add combination`)
};

const zh_player_playlist_add_combination = /** @type {(inputs: Player_Playlist_Add_CombinationInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`添加组合`)
};

/**
* | output |
* | --- |
* | "Add combination" |
*
* @param {Player_Playlist_Add_CombinationInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_playlist_add_combination = /** @type {((inputs?: Player_Playlist_Add_CombinationInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Playlist_Add_CombinationInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_playlist_add_combination(inputs)
	return en_player_playlist_add_combination(inputs)
});