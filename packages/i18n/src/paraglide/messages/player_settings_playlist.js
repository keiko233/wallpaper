/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Settings_PlaylistInputs */

const en_player_settings_playlist = /** @type {(inputs: Player_Settings_PlaylistInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Playlist`)
};

const zh_player_settings_playlist = /** @type {(inputs: Player_Settings_PlaylistInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`播放列表`)
};

/**
* | output |
* | --- |
* | "Playlist" |
*
* @param {Player_Settings_PlaylistInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_playlist = /** @type {((inputs?: Player_Settings_PlaylistInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Settings_PlaylistInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_settings_playlist(inputs)
	return en_player_settings_playlist(inputs)
});