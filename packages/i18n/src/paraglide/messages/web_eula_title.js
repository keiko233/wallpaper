/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Web_Eula_TitleInputs */

const en_web_eula_title = /** @type {(inputs: Web_Eula_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Community Resource Usage Agreement`)
};

const zh_web_eula_title = /** @type {(inputs: Web_Eula_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`社区资源使用协议`)
};

/**
* | output |
* | --- |
* | "Community Resource Usage Agreement" |
*
* @param {Web_Eula_TitleInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const web_eula_title = /** @type {((inputs?: Web_Eula_TitleInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Web_Eula_TitleInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_web_eula_title(inputs)
	return en_web_eula_title(inputs)
});