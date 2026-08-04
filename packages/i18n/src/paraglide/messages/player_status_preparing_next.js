/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Status_Preparing_NextInputs */

const en_player_status_preparing_next = /** @type {(inputs: Player_Status_Preparing_NextInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Preparing next`)
};

const zh_player_status_preparing_next = /** @type {(inputs: Player_Status_Preparing_NextInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`正在准备下一个`)
};

/**
* | output |
* | --- |
* | "Preparing next" |
*
* @param {Player_Status_Preparing_NextInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_status_preparing_next = /** @type {((inputs?: Player_Status_Preparing_NextInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Status_Preparing_NextInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_status_preparing_next(inputs)
	return en_player_status_preparing_next(inputs)
});