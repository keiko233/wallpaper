/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ui_PaginationInputs */

const en_ui_pagination = /** @type {(inputs: Ui_PaginationInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`pagination`)
};

const zh_ui_pagination = /** @type {(inputs: Ui_PaginationInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`分页`)
};

/**
* | output |
* | --- |
* | "pagination" |
*
* @param {Ui_PaginationInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const ui_pagination = /** @type {((inputs?: Ui_PaginationInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ui_PaginationInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_ui_pagination(inputs)
	return en_ui_pagination(inputs)
});