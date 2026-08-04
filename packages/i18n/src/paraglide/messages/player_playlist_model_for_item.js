/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ n: NonNullable<unknown> }} Player_Playlist_Model_For_ItemInputs */

const en_player_playlist_model_for_item = /** @type {(inputs: Player_Playlist_Model_For_ItemInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Model for item ${i?.n}`)
};

const zh_player_playlist_model_for_item = /** @type {(inputs: Player_Playlist_Model_For_ItemInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`第 ${i?.n} 项的模型`)
};

/**
* | output |
* | --- |
* | "Model for item {n}" |
*
* @param {Player_Playlist_Model_For_ItemInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_playlist_model_for_item = /** @type {((inputs: Player_Playlist_Model_For_ItemInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Playlist_Model_For_ItemInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_playlist_model_for_item(inputs)
	return en_player_playlist_model_for_item(inputs)
});