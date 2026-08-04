/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Delete_ResourceInputs */

const en_library_delete_resource = /** @type {(inputs: Library_Delete_ResourceInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Delete resource`)
};

const zh_library_delete_resource = /** @type {(inputs: Library_Delete_ResourceInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`删除资源`)
};

/**
* | output |
* | --- |
* | "Delete resource" |
*
* @param {Library_Delete_ResourceInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const library_delete_resource = /** @type {((inputs?: Library_Delete_ResourceInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Delete_ResourceInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_library_delete_resource(inputs)
	return en_library_delete_resource(inputs)
});