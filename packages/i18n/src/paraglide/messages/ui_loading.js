/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ui_LoadingInputs */

const en_ui_loading = /** @type {(inputs: Ui_LoadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Loading`)
};

const zh_ui_loading = /** @type {(inputs: Ui_LoadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`加载中`)
};

/**
* | output |
* | --- |
* | "Loading" |
*
* @param {Ui_LoadingInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const ui_loading = /** @type {((inputs?: Ui_LoadingInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ui_LoadingInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_ui_loading(inputs)
	return en_ui_loading(inputs)
});