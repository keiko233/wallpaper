/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Common_PreviousInputs */

const en_common_previous = /** @type {(inputs: Common_PreviousInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Previous`)
};

const zh_common_previous = /** @type {(inputs: Common_PreviousInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`上一项`)
};

/**
* | output |
* | --- |
* | "Previous" |
*
* @param {Common_PreviousInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const common_previous = /** @type {((inputs?: Common_PreviousInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Common_PreviousInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_common_previous(inputs)
	return en_common_previous(inputs)
});