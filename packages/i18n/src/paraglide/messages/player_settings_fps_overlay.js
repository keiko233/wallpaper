/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Settings_Fps_OverlayInputs */

const en_player_settings_fps_overlay = /** @type {(inputs: Player_Settings_Fps_OverlayInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`FPS overlay`)
};

const zh_player_settings_fps_overlay = /** @type {(inputs: Player_Settings_Fps_OverlayInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`FPS 悬浮窗`)
};

/**
* | output |
* | --- |
* | "FPS overlay" |
*
* @param {Player_Settings_Fps_OverlayInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_fps_overlay = /** @type {((inputs?: Player_Settings_Fps_OverlayInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Settings_Fps_OverlayInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_settings_fps_overlay(inputs)
	return en_player_settings_fps_overlay(inputs)
});