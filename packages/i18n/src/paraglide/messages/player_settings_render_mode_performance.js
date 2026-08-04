/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Settings_Render_Mode_PerformanceInputs */

const en_player_settings_render_mode_performance = /** @type {(inputs: Player_Settings_Render_Mode_PerformanceInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Performance`)
};

const zh_player_settings_render_mode_performance = /** @type {(inputs: Player_Settings_Render_Mode_PerformanceInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`性能`)
};

/**
* | output |
* | --- |
* | "Performance" |
*
* @param {Player_Settings_Render_Mode_PerformanceInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_render_mode_performance = /** @type {((inputs?: Player_Settings_Render_Mode_PerformanceInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Settings_Render_Mode_PerformanceInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_settings_render_mode_performance(inputs)
	return en_player_settings_render_mode_performance(inputs)
});