/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Settings_Render_Mode_MmdInputs */

const en_player_settings_render_mode_mmd = /** @type {(inputs: Player_Settings_Render_Mode_MmdInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`MMD accurate`)
};

const zh_player_settings_render_mode_mmd = /** @type {(inputs: Player_Settings_Render_Mode_MmdInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`MMD 精确`)
};

/**
* | output |
* | --- |
* | "MMD accurate" |
*
* @param {Player_Settings_Render_Mode_MmdInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_render_mode_mmd = /** @type {((inputs?: Player_Settings_Render_Mode_MmdInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Settings_Render_Mode_MmdInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_settings_render_mode_mmd(inputs)
	return en_player_settings_render_mode_mmd(inputs)
});