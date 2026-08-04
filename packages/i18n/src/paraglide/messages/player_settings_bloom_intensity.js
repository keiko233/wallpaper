/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Settings_Bloom_IntensityInputs */

const en_player_settings_bloom_intensity = /** @type {(inputs: Player_Settings_Bloom_IntensityInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Bloom intensity`)
};

const zh_player_settings_bloom_intensity = /** @type {(inputs: Player_Settings_Bloom_IntensityInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`泛光强度`)
};

/**
* | output |
* | --- |
* | "Bloom intensity" |
*
* @param {Player_Settings_Bloom_IntensityInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_bloom_intensity = /** @type {((inputs?: Player_Settings_Bloom_IntensityInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Settings_Bloom_IntensityInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_settings_bloom_intensity(inputs)
	return en_player_settings_bloom_intensity(inputs)
});