/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_None_InstalledInputs */

const en_library_none_installed = /** @type {(inputs: Library_None_InstalledInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No resources are installed on this device.`)
};

const zh_library_none_installed = /** @type {(inputs: Library_None_InstalledInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`本机未安装任何资源。`)
};

/**
* | output |
* | --- |
* | "No resources are installed on this device." |
*
* @param {Library_None_InstalledInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const library_none_installed = /** @type {((inputs?: Library_None_InstalledInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_None_InstalledInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_library_none_installed(inputs)
	return en_library_none_installed(inputs)
});