/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ui_Next_PageInputs */

const en_ui_next_page = /** @type {(inputs: Ui_Next_PageInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Go to next page`)
};

const zh_ui_next_page = /** @type {(inputs: Ui_Next_PageInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`转到下一页`)
};

/**
* | output |
* | --- |
* | "Go to next page" |
*
* @param {Ui_Next_PageInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const ui_next_page = /** @type {((inputs?: Ui_Next_PageInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ui_Next_PageInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_ui_next_page(inputs)
	return en_ui_next_page(inputs)
});