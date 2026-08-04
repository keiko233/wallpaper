/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Playlist_Restore_DefaultInputs */

const en_player_playlist_restore_default = /** @type {(inputs: Player_Playlist_Restore_DefaultInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Restore default`)
};

const zh_player_playlist_restore_default = /** @type {(inputs: Player_Playlist_Restore_DefaultInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`恢复默认`)
};

/**
* | output |
* | --- |
* | "Restore default" |
*
* @param {Player_Playlist_Restore_DefaultInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_playlist_restore_default = /** @type {((inputs?: Player_Playlist_Restore_DefaultInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Playlist_Restore_DefaultInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_playlist_restore_default(inputs)
	return en_player_playlist_restore_default(inputs)
});