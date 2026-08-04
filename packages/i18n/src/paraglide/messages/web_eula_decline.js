/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Web_Eula_DeclineInputs */

const en_web_eula_decline = /** @type {(inputs: Web_Eula_DeclineInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Decline`)
};

const zh_web_eula_decline = /** @type {(inputs: Web_Eula_DeclineInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`拒绝`)
};

/**
* | output |
* | --- |
* | "Decline" |
*
* @param {Web_Eula_DeclineInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const web_eula_decline = /** @type {((inputs?: Web_Eula_DeclineInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Web_Eula_DeclineInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_web_eula_decline(inputs)
	return en_web_eula_decline(inputs)
});