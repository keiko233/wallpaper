/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Settings_Show_Performance_Overlay_DescriptionInputs */

const en_player_settings_show_performance_overlay_description = /** @type {(inputs: Player_Settings_Show_Performance_Overlay_DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Shows FPS, frame time, 1% lows and GPU stats over the wallpaper.`)
};

const zh_player_settings_show_performance_overlay_description = /** @type {(inputs: Player_Settings_Show_Performance_Overlay_DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`在壁纸上显示 FPS、帧耗时、1% 低帧率和 GPU 统计信息。`)
};

/**
* | output |
* | --- |
* | "Shows FPS, frame time, 1% lows and GPU stats over the wallpaper." |
*
* @param {Player_Settings_Show_Performance_Overlay_DescriptionInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_show_performance_overlay_description = /** @type {((inputs?: Player_Settings_Show_Performance_Overlay_DescriptionInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Settings_Show_Performance_Overlay_DescriptionInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_settings_show_performance_overlay_description(inputs)
	return en_player_settings_show_performance_overlay_description(inputs)
});