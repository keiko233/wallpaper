/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Settings_Fps_Overlay_Key_SuffixInputs */

const en_player_settings_fps_overlay_key_suffix = /** @type {(inputs: Player_Settings_Fps_Overlay_Key_SuffixInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`key.`)
};

const zh_player_settings_fps_overlay_key_suffix = /** @type {(inputs: Player_Settings_Fps_Overlay_Key_SuffixInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`键切换。`)
};

/**
* | output |
* | --- |
* | "key." |
*
* @param {Player_Settings_Fps_Overlay_Key_SuffixInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_fps_overlay_key_suffix = /** @type {((inputs?: Player_Settings_Fps_Overlay_Key_SuffixInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Settings_Fps_Overlay_Key_SuffixInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_settings_fps_overlay_key_suffix(inputs)
	return en_player_settings_fps_overlay_key_suffix(inputs)
});