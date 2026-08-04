/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Status_PausedInputs */

const en_player_status_paused = /** @type {(inputs: Player_Status_PausedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Paused`)
};

const zh_player_status_paused = /** @type {(inputs: Player_Status_PausedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`已暂停`)
};

/**
* | output |
* | --- |
* | "Paused" |
*
* @param {Player_Status_PausedInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_status_paused = /** @type {((inputs?: Player_Status_PausedInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Status_PausedInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_status_paused(inputs)
	return en_player_status_paused(inputs)
});