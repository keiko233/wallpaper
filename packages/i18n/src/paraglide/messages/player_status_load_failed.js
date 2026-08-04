/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Status_Load_FailedInputs */

const en_player_status_load_failed = /** @type {(inputs: Player_Status_Load_FailedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Load failed`)
};

const zh_player_status_load_failed = /** @type {(inputs: Player_Status_Load_FailedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`加载失败`)
};

/**
* | output |
* | --- |
* | "Load failed" |
*
* @param {Player_Status_Load_FailedInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_status_load_failed = /** @type {((inputs?: Player_Status_Load_FailedInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Status_Load_FailedInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_status_load_failed(inputs)
	return en_player_status_load_failed(inputs)
});