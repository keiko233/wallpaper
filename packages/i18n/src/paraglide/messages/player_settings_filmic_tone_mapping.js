/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Settings_Filmic_Tone_MappingInputs */

const en_player_settings_filmic_tone_mapping = /** @type {(inputs: Player_Settings_Filmic_Tone_MappingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Filmic tone mapping`)
};

const zh_player_settings_filmic_tone_mapping = /** @type {(inputs: Player_Settings_Filmic_Tone_MappingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`胶片色调映射`)
};

/**
* | output |
* | --- |
* | "Filmic tone mapping" |
*
* @param {Player_Settings_Filmic_Tone_MappingInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_filmic_tone_mapping = /** @type {((inputs?: Player_Settings_Filmic_Tone_MappingInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Settings_Filmic_Tone_MappingInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_settings_filmic_tone_mapping(inputs)
	return en_player_settings_filmic_tone_mapping(inputs)
});