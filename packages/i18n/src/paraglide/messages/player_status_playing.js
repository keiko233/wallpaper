/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Status_PlayingInputs */

const en_player_status_playing = /** @type {(inputs: Player_Status_PlayingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Playing`)
};

const zh_player_status_playing = /** @type {(inputs: Player_Status_PlayingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`播放中`)
};

/**
* | output |
* | --- |
* | "Playing" |
*
* @param {Player_Status_PlayingInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_status_playing = /** @type {((inputs?: Player_Status_PlayingInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Status_PlayingInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_status_playing(inputs)
	return en_player_status_playing(inputs)
});