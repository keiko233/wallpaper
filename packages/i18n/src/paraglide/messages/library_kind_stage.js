/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Kind_StageInputs */

const en_library_kind_stage = /** @type {(inputs: Library_Kind_StageInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Stages`)
};

const zh_library_kind_stage = /** @type {(inputs: Library_Kind_StageInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`舞台`)
};

/**
* | output |
* | --- |
* | "Stages" |
*
* @param {Library_Kind_StageInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const library_kind_stage = /** @type {((inputs?: Library_Kind_StageInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Kind_StageInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_library_kind_stage(inputs)
	return en_library_kind_stage(inputs)
});