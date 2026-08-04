/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Pause_PlaybackInputs */

const en_player_pause_playback = /** @type {(inputs: Player_Pause_PlaybackInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Pause playback`)
};

const zh_player_pause_playback = /** @type {(inputs: Player_Pause_PlaybackInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`暂停播放`)
};

/**
* | output |
* | --- |
* | "Pause playback" |
*
* @param {Player_Pause_PlaybackInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_pause_playback = /** @type {((inputs?: Player_Pause_PlaybackInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Pause_PlaybackInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_pause_playback(inputs)
	return en_player_pause_playback(inputs)
});