/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_RevisionInputs */

const en_library_revision = /** @type {(inputs: Library_RevisionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Revision`)
};

const zh_library_revision = /** @type {(inputs: Library_RevisionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`版本号`)
};

/**
* | output |
* | --- |
* | "Revision" |
*
* @param {Library_RevisionInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const library_revision = /** @type {((inputs?: Library_RevisionInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_RevisionInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_library_revision(inputs)
	return en_library_revision(inputs)
});