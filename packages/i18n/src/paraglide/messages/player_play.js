/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_PlayInputs */

const en_player_play = /** @type {(inputs: Player_PlayInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Play`)
};

const zh_player_play = /** @type {(inputs: Player_PlayInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`播放`)
};

/**
* | output |
* | --- |
* | "Play" |
*
* @param {Player_PlayInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_play = /** @type {((inputs?: Player_PlayInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_PlayInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_play(inputs)
	return en_player_play(inputs)
});