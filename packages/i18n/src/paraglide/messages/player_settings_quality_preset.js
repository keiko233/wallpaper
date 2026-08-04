/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Settings_Quality_PresetInputs */

const en_player_settings_quality_preset = /** @type {(inputs: Player_Settings_Quality_PresetInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Quality preset`)
};

const zh_player_settings_quality_preset = /** @type {(inputs: Player_Settings_Quality_PresetInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`质量预设`)
};

/**
* | output |
* | --- |
* | "Quality preset" |
*
* @param {Player_Settings_Quality_PresetInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_quality_preset = /** @type {((inputs?: Player_Settings_Quality_PresetInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Settings_Quality_PresetInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_settings_quality_preset(inputs)
	return en_player_settings_quality_preset(inputs)
});