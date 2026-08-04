/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Settings_Ssr_QualityInputs */

const en_player_settings_ssr_quality = /** @type {(inputs: Player_Settings_Ssr_QualityInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`SSR quality`)
};

const zh_player_settings_ssr_quality = /** @type {(inputs: Player_Settings_Ssr_QualityInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`SSR 质量`)
};

/**
* | output |
* | --- |
* | "SSR quality" |
*
* @param {Player_Settings_Ssr_QualityInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_ssr_quality = /** @type {((inputs?: Player_Settings_Ssr_QualityInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Settings_Ssr_QualityInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_settings_ssr_quality(inputs)
	return en_player_settings_ssr_quality(inputs)
});