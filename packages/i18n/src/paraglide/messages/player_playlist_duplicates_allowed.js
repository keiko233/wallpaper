/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Playlist_Duplicates_AllowedInputs */

const en_player_playlist_duplicates_allowed = /** @type {(inputs: Player_Playlist_Duplicates_AllowedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Duplicate combinations are allowed.`)
};

const zh_player_playlist_duplicates_allowed = /** @type {(inputs: Player_Playlist_Duplicates_AllowedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`允许重复组合。`)
};

/**
* | output |
* | --- |
* | "Duplicate combinations are allowed." |
*
* @param {Player_Playlist_Duplicates_AllowedInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_playlist_duplicates_allowed = /** @type {((inputs?: Player_Playlist_Duplicates_AllowedInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Playlist_Duplicates_AllowedInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_playlist_duplicates_allowed(inputs)
	return en_player_playlist_duplicates_allowed(inputs)
});