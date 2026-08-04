/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Settings_Quality_Preset_BalancedInputs */

const en_player_settings_quality_preset_balanced = /** @type {(inputs: Player_Settings_Quality_Preset_BalancedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Balanced`)
};

const zh_player_settings_quality_preset_balanced = /** @type {(inputs: Player_Settings_Quality_Preset_BalancedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`平衡`)
};

/**
* | output |
* | --- |
* | "Balanced" |
*
* @param {Player_Settings_Quality_Preset_BalancedInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_quality_preset_balanced = /** @type {((inputs?: Player_Settings_Quality_Preset_BalancedInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Settings_Quality_Preset_BalancedInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_settings_quality_preset_balanced(inputs)
	return en_player_settings_quality_preset_balanced(inputs)
});