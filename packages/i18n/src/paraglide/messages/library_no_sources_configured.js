/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_No_Sources_ConfiguredInputs */

const en_library_no_sources_configured = /** @type {(inputs: Library_No_Sources_ConfiguredInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No resource sources configured.`)
};

const zh_library_no_sources_configured = /** @type {(inputs: Library_No_Sources_ConfiguredInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`未配置任何资源来源。`)
};

/**
* | output |
* | --- |
* | "No resource sources configured." |
*
* @param {Library_No_Sources_ConfiguredInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const library_no_sources_configured = /** @type {((inputs?: Library_No_Sources_ConfiguredInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_No_Sources_ConfiguredInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_library_no_sources_configured(inputs)
	return en_library_no_sources_configured(inputs)
});