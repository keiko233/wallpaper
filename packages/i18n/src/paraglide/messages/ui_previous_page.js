/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ui_Previous_PageInputs */

const en_ui_previous_page = /** @type {(inputs: Ui_Previous_PageInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Go to previous page`)
};

const zh_ui_previous_page = /** @type {(inputs: Ui_Previous_PageInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`转到上一页`)
};

/**
* | output |
* | --- |
* | "Go to previous page" |
*
* @param {Ui_Previous_PageInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const ui_previous_page = /** @type {((inputs?: Ui_Previous_PageInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ui_Previous_PageInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_ui_previous_page(inputs)
	return en_ui_previous_page(inputs)
});