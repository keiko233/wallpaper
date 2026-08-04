/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Kind_SkyboxInputs */

const en_library_kind_skybox = /** @type {(inputs: Library_Kind_SkyboxInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Skyboxes`)
};

const zh_library_kind_skybox = /** @type {(inputs: Library_Kind_SkyboxInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`天空盒`)
};

/**
* | output |
* | --- |
* | "Skyboxes" |
*
* @param {Library_Kind_SkyboxInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const library_kind_skybox = /** @type {((inputs?: Library_Kind_SkyboxInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Kind_SkyboxInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_library_kind_skybox(inputs)
	return en_library_kind_skybox(inputs)
});