/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Status_WaitingInputs */

const en_player_status_waiting = /** @type {(inputs: Player_Status_WaitingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Waiting`)
};

const zh_player_status_waiting = /** @type {(inputs: Player_Status_WaitingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`等待中`)
};

/**
* | output |
* | --- |
* | "Waiting" |
*
* @param {Player_Status_WaitingInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_status_waiting = /** @type {((inputs?: Player_Status_WaitingInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Status_WaitingInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_status_waiting(inputs)
	return en_player_status_waiting(inputs)
});