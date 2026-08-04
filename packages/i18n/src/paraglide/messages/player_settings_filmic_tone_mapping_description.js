/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Settings_Filmic_Tone_Mapping_DescriptionInputs */

const en_player_settings_filmic_tone_mapping_description = /** @type {(inputs: Player_Settings_Filmic_Tone_Mapping_DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`ACES tone mapping keeps bright areas filmic and controlled.`)
};

const zh_player_settings_filmic_tone_mapping_description = /** @type {(inputs: Player_Settings_Filmic_Tone_Mapping_DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`ACES 色调映射让高光区域保持胶片质感和可控。`)
};

/**
* | output |
* | --- |
* | "ACES tone mapping keeps bright areas filmic and controlled." |
*
* @param {Player_Settings_Filmic_Tone_Mapping_DescriptionInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_filmic_tone_mapping_description = /** @type {((inputs?: Player_Settings_Filmic_Tone_Mapping_DescriptionInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Settings_Filmic_Tone_Mapping_DescriptionInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_settings_filmic_tone_mapping_description(inputs)
	return en_player_settings_filmic_tone_mapping_description(inputs)
});