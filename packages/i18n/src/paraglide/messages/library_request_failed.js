/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Request_FailedInputs */

const en_library_request_failed = /** @type {(inputs: Library_Request_FailedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Resource request failed`)
};

const zh_library_request_failed = /** @type {(inputs: Library_Request_FailedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`资源请求失败`)
};

/**
* | output |
* | --- |
* | "Resource request failed" |
*
* @param {Library_Request_FailedInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const library_request_failed = /** @type {((inputs?: Library_Request_FailedInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Request_FailedInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_library_request_failed(inputs)
	return en_library_request_failed(inputs)
});