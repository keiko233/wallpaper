/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Source_Url_LabelInputs */

const en_library_source_url_label = /** @type {(inputs: Library_Source_Url_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Resource source URL`)
};

const zh_library_source_url_label = /** @type {(inputs: Library_Source_Url_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`资源来源 URL`)
};

/**
* | output |
* | --- |
* | "Resource source URL" |
*
* @param {Library_Source_Url_LabelInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const library_source_url_label = /** @type {((inputs?: Library_Source_Url_LabelInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Source_Url_LabelInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_library_source_url_label(inputs)
	return en_library_source_url_label(inputs)
});