/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Empty_TitleInputs */

const en_library_empty_title = /** @type {(inputs: Library_Empty_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Add a resource source to get started`)
};

const zh_library_empty_title = /** @type {(inputs: Library_Empty_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`添加资源来源以开始`)
};

/**
* | output |
* | --- |
* | "Add a resource source to get started" |
*
* @param {Library_Empty_TitleInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const library_empty_title = /** @type {((inputs?: Library_Empty_TitleInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Empty_TitleInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_library_empty_title(inputs)
	return en_library_empty_title(inputs)
});