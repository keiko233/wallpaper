/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Web_Local_Library_Load_FailedInputs */

const en_web_local_library_load_failed = /** @type {(inputs: Web_Local_Library_Load_FailedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Local library could not be loaded`)
};

const zh_web_local_library_load_failed = /** @type {(inputs: Web_Local_Library_Load_FailedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`无法加载本地资源库`)
};

/**
* | output |
* | --- |
* | "Local library could not be loaded" |
*
* @param {Web_Local_Library_Load_FailedInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const web_local_library_load_failed = /** @type {((inputs?: Web_Local_Library_Load_FailedInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Web_Local_Library_Load_FailedInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_web_local_library_load_failed(inputs)
	return en_web_local_library_load_failed(inputs)
});