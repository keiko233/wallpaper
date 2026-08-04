/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Settings_Ssao_StrengthInputs */

const en_player_settings_ssao_strength = /** @type {(inputs: Player_Settings_Ssao_StrengthInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`SSAO strength`)
};

const zh_player_settings_ssao_strength = /** @type {(inputs: Player_Settings_Ssao_StrengthInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`SSAO 强度`)
};

/**
* | output |
* | --- |
* | "SSAO strength" |
*
* @param {Player_Settings_Ssao_StrengthInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_ssao_strength = /** @type {((inputs?: Player_Settings_Ssao_StrengthInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Settings_Ssao_StrengthInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_settings_ssao_strength(inputs)
	return en_player_settings_ssao_strength(inputs)
});