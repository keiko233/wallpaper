/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ui_BreadcrumbInputs */

const en_ui_breadcrumb = /** @type {(inputs: Ui_BreadcrumbInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`breadcrumb`)
};

const zh_ui_breadcrumb = /** @type {(inputs: Ui_BreadcrumbInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`面包屑`)
};

/**
* | output |
* | --- |
* | "breadcrumb" |
*
* @param {Ui_BreadcrumbInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const ui_breadcrumb = /** @type {((inputs?: Ui_BreadcrumbInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ui_BreadcrumbInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_ui_breadcrumb(inputs)
	return en_ui_breadcrumb(inputs)
});