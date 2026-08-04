/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Last_Refresh_FailedInputs */

const en_library_last_refresh_failed = /** @type {(inputs: Library_Last_Refresh_FailedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Last refresh failed`)
};

const zh_library_last_refresh_failed = /** @type {(inputs: Library_Last_Refresh_FailedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`上次刷新失败`)
};

/**
* | output |
* | --- |
* | "Last refresh failed" |
*
* @param {Library_Last_Refresh_FailedInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const library_last_refresh_failed = /** @type {((inputs?: Library_Last_Refresh_FailedInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Last_Refresh_FailedInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_library_last_refresh_failed(inputs)
	return en_library_last_refresh_failed(inputs)
});