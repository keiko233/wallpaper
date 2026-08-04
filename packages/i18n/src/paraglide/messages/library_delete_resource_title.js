/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ name: NonNullable<unknown> }} Library_Delete_Resource_TitleInputs */

const en_library_delete_resource_title = /** @type {(inputs: Library_Delete_Resource_TitleInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Delete ${i?.name}?`)
};

const zh_library_delete_resource_title = /** @type {(inputs: Library_Delete_Resource_TitleInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`删除 ${i?.name}？`)
};

/**
* | output |
* | --- |
* | "Delete {name}?" |
*
* @param {Library_Delete_Resource_TitleInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const library_delete_resource_title = /** @type {((inputs: Library_Delete_Resource_TitleInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Delete_Resource_TitleInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_library_delete_resource_title(inputs)
	return en_library_delete_resource_title(inputs)
});