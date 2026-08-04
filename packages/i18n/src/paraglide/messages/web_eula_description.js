/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Web_Eula_DescriptionInputs */

const en_web_eula_description = /** @type {(inputs: Web_Eula_DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The default resource source provides resources contributed by community third parties. Please review the agreement below before using it.`)
};

const zh_web_eula_description = /** @type {(inputs: Web_Eula_DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`默认资源来源提供由社区第三方贡献的资源，使用前请仔细阅读以下协议。`)
};

/**
* | output |
* | --- |
* | "The default resource source provides resources contributed by community third parties. Please review the agreement below before using it." |
*
* @param {Web_Eula_DescriptionInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const web_eula_description = /** @type {((inputs?: Web_Eula_DescriptionInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Web_Eula_DescriptionInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_web_eula_description(inputs)
	return en_web_eula_description(inputs)
});