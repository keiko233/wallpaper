/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Settings_Render_QualityInputs */

const en_player_settings_render_quality = /** @type {(inputs: Player_Settings_Render_QualityInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Render quality`)
};

const zh_player_settings_render_quality = /** @type {(inputs: Player_Settings_Render_QualityInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`渲染质量`)
};

/**
* | output |
* | --- |
* | "Render quality" |
*
* @param {Player_Settings_Render_QualityInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_render_quality = /** @type {((inputs?: Player_Settings_Render_QualityInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Settings_Render_QualityInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_settings_render_quality(inputs)
	return en_player_settings_render_quality(inputs)
});