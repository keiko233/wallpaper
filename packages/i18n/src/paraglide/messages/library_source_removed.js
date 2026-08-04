/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Source_RemovedInputs */

const en_library_source_removed = /** @type {(inputs: Library_Source_RemovedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Source removed`)
};

const zh_library_source_removed = /** @type {(inputs: Library_Source_RemovedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`来源已移除`)
};

/**
* | output |
* | --- |
* | "Source removed" |
*
* @param {Library_Source_RemovedInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const library_source_removed = /** @type {((inputs?: Library_Source_RemovedInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Source_RemovedInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_library_source_removed(inputs)
	return en_library_source_removed(inputs)
});