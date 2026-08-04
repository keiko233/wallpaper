/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Progress_ExtractingInputs */

const en_library_progress_extracting = /** @type {(inputs: Library_Progress_ExtractingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Preparing local files`)
};

const zh_library_progress_extracting = /** @type {(inputs: Library_Progress_ExtractingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`正在准备本地文件`)
};

/**
* | output |
* | --- |
* | "Preparing local files" |
*
* @param {Library_Progress_ExtractingInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const library_progress_extracting = /** @type {((inputs?: Library_Progress_ExtractingInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Progress_ExtractingInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_library_progress_extracting(inputs)
	return en_library_progress_extracting(inputs)
});