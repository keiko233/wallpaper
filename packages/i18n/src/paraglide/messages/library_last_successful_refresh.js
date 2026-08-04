/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Last_Successful_RefreshInputs */

const en_library_last_successful_refresh = /** @type {(inputs: Library_Last_Successful_RefreshInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Last successful refresh`)
};

const zh_library_last_successful_refresh = /** @type {(inputs: Library_Last_Successful_RefreshInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`上次成功刷新`)
};

/**
* | output |
* | --- |
* | "Last successful refresh" |
*
* @param {Library_Last_Successful_RefreshInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const library_last_successful_refresh = /** @type {((inputs?: Library_Last_Successful_RefreshInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Last_Successful_RefreshInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_library_last_successful_refresh(inputs)
	return en_library_last_successful_refresh(inputs)
});