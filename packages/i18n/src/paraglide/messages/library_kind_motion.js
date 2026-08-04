/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Kind_MotionInputs */

const en_library_kind_motion = /** @type {(inputs: Library_Kind_MotionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Motions`)
};

const zh_library_kind_motion = /** @type {(inputs: Library_Kind_MotionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`动作`)
};

/**
* | output |
* | --- |
* | "Motions" |
*
* @param {Library_Kind_MotionInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const library_kind_motion = /** @type {((inputs?: Library_Kind_MotionInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Kind_MotionInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_library_kind_motion(inputs)
	return en_library_kind_motion(inputs)
});