/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Settings_Quality_Preset_CustomInputs */

const en_player_settings_quality_preset_custom = /** @type {(inputs: Player_Settings_Quality_Preset_CustomInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Custom`)
};

const zh_player_settings_quality_preset_custom = /** @type {(inputs: Player_Settings_Quality_Preset_CustomInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`自定义`)
};

/**
* | output |
* | --- |
* | "Custom" |
*
* @param {Player_Settings_Quality_Preset_CustomInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_quality_preset_custom = /** @type {((inputs?: Player_Settings_Quality_Preset_CustomInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Settings_Quality_Preset_CustomInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_settings_quality_preset_custom(inputs)
	return en_player_settings_quality_preset_custom(inputs)
});