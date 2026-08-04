/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Kind_VideoInputs */

const en_library_kind_video = /** @type {(inputs: Library_Kind_VideoInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Videos`)
};

const zh_library_kind_video = /** @type {(inputs: Library_Kind_VideoInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`视频`)
};

/**
* | output |
* | --- |
* | "Videos" |
*
* @param {Library_Kind_VideoInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const library_kind_video = /** @type {((inputs?: Library_Kind_VideoInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Kind_VideoInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_library_kind_video(inputs)
	return en_library_kind_video(inputs)
});