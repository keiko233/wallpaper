/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Settings_Fps_Overlay_DescriptionInputs */

const en_player_settings_fps_overlay_description = /** @type {(inputs: Player_Settings_Fps_Overlay_DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`RTSS-style frame time monitor over the wallpaper. Toggle it anytime with the`)
};

const zh_player_settings_fps_overlay_description = /** @type {(inputs: Player_Settings_Fps_Overlay_DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`RTSS 风格的帧耗时监视器，可随时用`)
};

/**
* | output |
* | --- |
* | "RTSS-style frame time monitor over the wallpaper. Toggle it anytime with the" |
*
* @param {Player_Settings_Fps_Overlay_DescriptionInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_fps_overlay_description = /** @type {((inputs?: Player_Settings_Fps_Overlay_DescriptionInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Settings_Fps_Overlay_DescriptionInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_settings_fps_overlay_description(inputs)
	return en_player_settings_fps_overlay_description(inputs)
});