/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Web_Eula_AcceptInputs */

const en_web_eula_accept = /** @type {(inputs: Web_Eula_AcceptInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`I agree`)
};

const zh_web_eula_accept = /** @type {(inputs: Web_Eula_AcceptInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`同意并继续`)
};

/**
* | output |
* | --- |
* | "I agree" |
*
* @param {Web_Eula_AcceptInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const web_eula_accept = /** @type {((inputs?: Web_Eula_AcceptInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Web_Eula_AcceptInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_web_eula_accept(inputs)
	return en_web_eula_accept(inputs)
});