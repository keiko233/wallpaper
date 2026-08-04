/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Progress_DownloadingInputs */

const en_library_progress_downloading = /** @type {(inputs: Library_Progress_DownloadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Downloading artifact`)
};

const zh_library_progress_downloading = /** @type {(inputs: Library_Progress_DownloadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`正在下载资源文件`)
};

/**
* | output |
* | --- |
* | "Downloading artifact" |
*
* @param {Library_Progress_DownloadingInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const library_progress_downloading = /** @type {((inputs?: Library_Progress_DownloadingInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Progress_DownloadingInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_library_progress_downloading(inputs)
	return en_library_progress_downloading(inputs)
});