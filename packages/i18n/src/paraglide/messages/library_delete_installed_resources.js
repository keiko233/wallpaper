/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Delete_Installed_ResourcesInputs */

const en_library_delete_installed_resources = /** @type {(inputs: Library_Delete_Installed_ResourcesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Delete installed resources`)
};

const zh_library_delete_installed_resources = /** @type {(inputs: Library_Delete_Installed_ResourcesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`删除已安装资源`)
};

/**
* | output |
* | --- |
* | "Delete installed resources" |
*
* @param {Library_Delete_Installed_ResourcesInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const library_delete_installed_resources = /** @type {((inputs?: Library_Delete_Installed_ResourcesInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Delete_Installed_ResourcesInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_library_delete_installed_resources(inputs)
	return en_library_delete_installed_resources(inputs)
});