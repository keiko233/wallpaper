/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ui_SidebarInputs */

const en_ui_sidebar = /** @type {(inputs: Ui_SidebarInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Sidebar`)
};

const zh_ui_sidebar = /** @type {(inputs: Ui_SidebarInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`侧边栏`)
};

/**
* | output |
* | --- |
* | "Sidebar" |
*
* @param {Ui_SidebarInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const ui_sidebar = /** @type {((inputs?: Ui_SidebarInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ui_SidebarInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_ui_sidebar(inputs)
	return en_ui_sidebar(inputs)
});