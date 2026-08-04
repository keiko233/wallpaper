/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Progress_VerifyingInputs */

const en_library_progress_verifying = /** @type {(inputs: Library_Progress_VerifyingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Verifying SHA-256`)
};

const zh_library_progress_verifying = /** @type {(inputs: Library_Progress_VerifyingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`正在校验 SHA-256`)
};

/**
* | output |
* | --- |
* | "Verifying SHA-256" |
*
* @param {Library_Progress_VerifyingInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const library_progress_verifying = /** @type {((inputs?: Library_Progress_VerifyingInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Progress_VerifyingInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_library_progress_verifying(inputs)
	return en_library_progress_verifying(inputs)
});