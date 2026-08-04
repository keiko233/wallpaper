/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_PauseInputs */

const en_player_pause = /** @type {(inputs: Player_PauseInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Pause`)
};

const zh_player_pause = /** @type {(inputs: Player_PauseInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`暂停`)
};

/**
* | output |
* | --- |
* | "Pause" |
*
* @param {Player_PauseInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_pause = /** @type {((inputs?: Player_PauseInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_PauseInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_pause(inputs)
	return en_player_pause(inputs)
});