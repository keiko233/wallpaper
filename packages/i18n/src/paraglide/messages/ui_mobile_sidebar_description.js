/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ui_Mobile_Sidebar_DescriptionInputs */

const en_ui_mobile_sidebar_description = /** @type {(inputs: Ui_Mobile_Sidebar_DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Displays the mobile sidebar.`)
};

const zh_ui_mobile_sidebar_description = /** @type {(inputs: Ui_Mobile_Sidebar_DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`在移动端显示侧边栏。`)
};

/**
* | output |
* | --- |
* | "Displays the mobile sidebar." |
*
* @param {Ui_Mobile_Sidebar_DescriptionInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const ui_mobile_sidebar_description = /** @type {((inputs?: Ui_Mobile_Sidebar_DescriptionInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ui_Mobile_Sidebar_DescriptionInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_ui_mobile_sidebar_description(inputs)
	return en_ui_mobile_sidebar_description(inputs)
});