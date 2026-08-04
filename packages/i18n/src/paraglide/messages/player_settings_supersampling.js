/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Settings_SupersamplingInputs */

const en_player_settings_supersampling = /** @type {(inputs: Player_Settings_SupersamplingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Supersampling`)
};

const zh_player_settings_supersampling = /** @type {(inputs: Player_Settings_SupersamplingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`超采样`)
};

/**
* | output |
* | --- |
* | "Supersampling" |
*
* @param {Player_Settings_SupersamplingInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_supersampling = /** @type {((inputs?: Player_Settings_SupersamplingInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Settings_SupersamplingInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_settings_supersampling(inputs)
	return en_player_settings_supersampling(inputs)
});