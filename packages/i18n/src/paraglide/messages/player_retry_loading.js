/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Retry_LoadingInputs */

const en_player_retry_loading = /** @type {(inputs: Player_Retry_LoadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Retry loading`)
};

const zh_player_retry_loading = /** @type {(inputs: Player_Retry_LoadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`重试加载`)
};

/**
* | output |
* | --- |
* | "Retry loading" |
*
* @param {Player_Retry_LoadingInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_retry_loading = /** @type {((inputs?: Player_Retry_LoadingInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Retry_LoadingInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_retry_loading(inputs)
	return en_player_retry_loading(inputs)
});