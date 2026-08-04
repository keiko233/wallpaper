/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ui_Toggle_SidebarInputs */

const en_ui_toggle_sidebar = /** @type {(inputs: Ui_Toggle_SidebarInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Toggle Sidebar`)
};

const zh_ui_toggle_sidebar = /** @type {(inputs: Ui_Toggle_SidebarInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`切换侧边栏`)
};

/**
* | output |
* | --- |
* | "Toggle Sidebar" |
*
* @param {Ui_Toggle_SidebarInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const ui_toggle_sidebar = /** @type {((inputs?: Ui_Toggle_SidebarInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ui_Toggle_SidebarInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_ui_toggle_sidebar(inputs)
	return en_ui_toggle_sidebar(inputs)
});