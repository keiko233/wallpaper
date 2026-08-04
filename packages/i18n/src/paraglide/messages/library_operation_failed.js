/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Operation_FailedInputs */

const en_library_operation_failed = /** @type {(inputs: Library_Operation_FailedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Resource operation failed`)
};

const zh_library_operation_failed = /** @type {(inputs: Library_Operation_FailedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`资源操作失败`)
};

/**
* | output |
* | --- |
* | "Resource operation failed" |
*
* @param {Library_Operation_FailedInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const library_operation_failed = /** @type {((inputs?: Library_Operation_FailedInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Operation_FailedInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_library_operation_failed(inputs)
	return en_library_operation_failed(inputs)
});