/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Settings_Quality_Preset_UltraInputs */

const en_player_settings_quality_preset_ultra = /** @type {(inputs: Player_Settings_Quality_Preset_UltraInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ultra`)
};

const zh_player_settings_quality_preset_ultra = /** @type {(inputs: Player_Settings_Quality_Preset_UltraInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`极致`)
};

/**
* | output |
* | --- |
* | "Ultra" |
*
* @param {Player_Settings_Quality_Preset_UltraInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_quality_preset_ultra = /** @type {((inputs?: Player_Settings_Quality_Preset_UltraInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Settings_Quality_Preset_UltraInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_settings_quality_preset_ultra(inputs)
	return en_player_settings_quality_preset_ultra(inputs)
});