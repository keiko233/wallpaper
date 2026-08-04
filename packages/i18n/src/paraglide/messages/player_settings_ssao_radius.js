/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Settings_Ssao_RadiusInputs */

const en_player_settings_ssao_radius = /** @type {(inputs: Player_Settings_Ssao_RadiusInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`SSAO radius`)
};

const zh_player_settings_ssao_radius = /** @type {(inputs: Player_Settings_Ssao_RadiusInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`SSAO 半径`)
};

/**
* | output |
* | --- |
* | "SSAO radius" |
*
* @param {Player_Settings_Ssao_RadiusInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_ssao_radius = /** @type {((inputs?: Player_Settings_Ssao_RadiusInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Settings_Ssao_RadiusInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_settings_ssao_radius(inputs)
	return en_player_settings_ssao_radius(inputs)
});