/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Settings_Quality_Preset_High_QualityInputs */

const en_player_settings_quality_preset_high_quality = /** @type {(inputs: Player_Settings_Quality_Preset_High_QualityInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`High quality`)
};

const zh_player_settings_quality_preset_high_quality = /** @type {(inputs: Player_Settings_Quality_Preset_High_QualityInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`高质量`)
};

/**
* | output |
* | --- |
* | "High quality" |
*
* @param {Player_Settings_Quality_Preset_High_QualityInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_quality_preset_high_quality = /** @type {((inputs?: Player_Settings_Quality_Preset_High_QualityInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Settings_Quality_Preset_High_QualityInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_settings_quality_preset_high_quality(inputs)
	return en_player_settings_quality_preset_high_quality(inputs)
});