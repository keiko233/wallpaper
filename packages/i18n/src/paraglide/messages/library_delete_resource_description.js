/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Delete_Resource_DescriptionInputs */

const en_library_delete_resource_description = /** @type {(inputs: Library_Delete_Resource_DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`This removes the resource from the player and deletes its local files when they are not shared by another installed resource. The resource source remains configured.`)
};

const zh_library_delete_resource_description = /** @type {(inputs: Library_Delete_Resource_DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`这会将资源从播放器中移除，并在其本地文件未被其他已安装资源共享时删除。资源来源仍会保留配置。`)
};

/**
* | output |
* | --- |
* | "This removes the resource from the player and deletes its local files when they are not shared by another installed resource. The resource source remains con..." |
*
* @param {Library_Delete_Resource_DescriptionInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const library_delete_resource_description = /** @type {((inputs?: Library_Delete_Resource_DescriptionInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Delete_Resource_DescriptionInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_library_delete_resource_description(inputs)
	return en_library_delete_resource_description(inputs)
});