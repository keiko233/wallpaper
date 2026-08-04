/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Tab_InstalledInputs */

const en_library_tab_installed = /** @type {(inputs: Library_Tab_InstalledInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Installed`)
};

const zh_library_tab_installed = /** @type {(inputs: Library_Tab_InstalledInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`已安装`)
};

/**
* | output |
* | --- |
* | "Installed" |
*
* @param {Library_Tab_InstalledInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const library_tab_installed = /** @type {((inputs?: Library_Tab_InstalledInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Tab_InstalledInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_library_tab_installed(inputs)
	return en_library_tab_installed(inputs)
});