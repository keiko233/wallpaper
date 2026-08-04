/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Status_LoadingInputs */

const en_player_status_loading = /** @type {(inputs: Player_Status_LoadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Loading`)
};

const zh_player_status_loading = /** @type {(inputs: Player_Status_LoadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`加载中`)
};

/**
* | output |
* | --- |
* | "Loading" |
*
* @param {Player_Status_LoadingInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_status_loading = /** @type {((inputs?: Player_Status_LoadingInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Status_LoadingInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_status_loading(inputs)
	return en_player_status_loading(inputs)
});