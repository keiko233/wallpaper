/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Status_ReadyInputs */

const en_player_status_ready = /** @type {(inputs: Player_Status_ReadyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ready`)
};

const zh_player_status_ready = /** @type {(inputs: Player_Status_ReadyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`就绪`)
};

/**
* | output |
* | --- |
* | "Ready" |
*
* @param {Player_Status_ReadyInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_status_ready = /** @type {((inputs?: Player_Status_ReadyInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Status_ReadyInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_status_ready(inputs)
	return en_player_status_ready(inputs)
});