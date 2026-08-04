/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_ResourcesInputs */

const en_library_resources = /** @type {(inputs: Library_ResourcesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Resources`)
};

const zh_library_resources = /** @type {(inputs: Library_ResourcesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`资源`)
};

/**
* | output |
* | --- |
* | "Resources" |
*
* @param {Library_ResourcesInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const library_resources = /** @type {((inputs?: Library_ResourcesInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_ResourcesInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_library_resources(inputs)
	return en_library_resources(inputs)
});