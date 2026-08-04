/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Source_Operation_FailedInputs */

const en_library_source_operation_failed = /** @type {(inputs: Library_Source_Operation_FailedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Source operation failed`)
};

const zh_library_source_operation_failed = /** @type {(inputs: Library_Source_Operation_FailedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`来源操作失败`)
};

/**
* | output |
* | --- |
* | "Source operation failed" |
*
* @param {Library_Source_Operation_FailedInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const library_source_operation_failed = /** @type {((inputs?: Library_Source_Operation_FailedInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Source_Operation_FailedInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_library_source_operation_failed(inputs)
	return en_library_source_operation_failed(inputs)
});