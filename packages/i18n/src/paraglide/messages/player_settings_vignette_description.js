/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Settings_Vignette_DescriptionInputs */

const en_player_settings_vignette_description = /** @type {(inputs: Player_Settings_Vignette_DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Darkens the frame edges to draw attention to the model.`)
};

const zh_player_settings_vignette_description = /** @type {(inputs: Player_Settings_Vignette_DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`压暗画面边缘以突出模型。`)
};

/**
* | output |
* | --- |
* | "Darkens the frame edges to draw attention to the model." |
*
* @param {Player_Settings_Vignette_DescriptionInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_vignette_description = /** @type {((inputs?: Player_Settings_Vignette_DescriptionInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Settings_Vignette_DescriptionInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_settings_vignette_description(inputs)
	return en_player_settings_vignette_description(inputs)
});