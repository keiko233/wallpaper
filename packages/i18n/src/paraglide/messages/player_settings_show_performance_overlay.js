/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Settings_Show_Performance_OverlayInputs */

const en_player_settings_show_performance_overlay = /** @type {(inputs: Player_Settings_Show_Performance_OverlayInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Show performance overlay`)
};

const zh_player_settings_show_performance_overlay = /** @type {(inputs: Player_Settings_Show_Performance_OverlayInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`显示性能悬浮窗`)
};

/**
* | output |
* | --- |
* | "Show performance overlay" |
*
* @param {Player_Settings_Show_Performance_OverlayInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_show_performance_overlay = /** @type {((inputs?: Player_Settings_Show_Performance_OverlayInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Settings_Show_Performance_OverlayInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_settings_show_performance_overlay(inputs)
	return en_player_settings_show_performance_overlay(inputs)
});