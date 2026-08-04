/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_View_InstalledInputs */

const en_library_view_installed = /** @type {(inputs: Library_View_InstalledInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`View installed resources`)
};

const zh_library_view_installed = /** @type {(inputs: Library_View_InstalledInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`查看已安装资源`)
};

/**
* | output |
* | --- |
* | "View installed resources" |
*
* @param {Library_View_InstalledInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const library_view_installed = /** @type {((inputs?: Library_View_InstalledInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_View_InstalledInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_library_view_installed(inputs)
	return en_library_view_installed(inputs)
});