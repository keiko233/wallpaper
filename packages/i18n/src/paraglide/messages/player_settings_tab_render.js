/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Settings_Tab_RenderInputs */

const en_player_settings_tab_render = /** @type {(inputs: Player_Settings_Tab_RenderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Render`)
};

const zh_player_settings_tab_render = /** @type {(inputs: Player_Settings_Tab_RenderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`渲染`)
};

/**
* | output |
* | --- |
* | "Render" |
*
* @param {Player_Settings_Tab_RenderInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_tab_render = /** @type {((inputs?: Player_Settings_Tab_RenderInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Settings_Tab_RenderInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_settings_tab_render(inputs)
	return en_player_settings_tab_render(inputs)
});