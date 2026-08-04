/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ version: NonNullable<unknown> }} Library_VersionInputs */

const en_library_version = /** @type {(inputs: Library_VersionInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Version ${i?.version}`)
};

const zh_library_version = /** @type {(inputs: Library_VersionInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`版本 ${i?.version}`)
};

/**
* | output |
* | --- |
* | "Version {version}" |
*
* @param {Library_VersionInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const library_version = /** @type {((inputs: Library_VersionInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_VersionInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_library_version(inputs)
	return en_library_version(inputs)
});