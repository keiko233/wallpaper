/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ sourceName: NonNullable<unknown>, status: NonNullable<unknown> }} Library_Source_Is_StatusInputs */

const en_library_source_is_status = /** @type {(inputs: Library_Source_Is_StatusInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.sourceName} is ${i?.status}`)
};

const zh_library_source_is_status = /** @type {(inputs: Library_Source_Is_StatusInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.sourceName} 当前状态为 ${i?.status}`)
};

/**
* | output |
* | --- |
* | "{sourceName} is {status}" |
*
* @param {Library_Source_Is_StatusInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const library_source_is_status = /** @type {((inputs: Library_Source_Is_StatusInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Source_Is_StatusInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_library_source_is_status(inputs)
	return en_library_source_is_status(inputs)
});