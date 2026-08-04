/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_SetupInputs */

const en_player_setup = /** @type {(inputs: Player_SetupInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Player setup`)
};

const zh_player_setup = /** @type {(inputs: Player_SetupInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`播放器设置`)
};

/**
* | output |
* | --- |
* | "Player setup" |
*
* @param {Player_SetupInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_setup = /** @type {((inputs?: Player_SetupInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_SetupInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_setup(inputs)
	return en_player_setup(inputs)
});