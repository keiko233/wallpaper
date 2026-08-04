/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Settings_Bloom_ThresholdInputs */

const en_player_settings_bloom_threshold = /** @type {(inputs: Player_Settings_Bloom_ThresholdInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Bloom threshold`)
};

const zh_player_settings_bloom_threshold = /** @type {(inputs: Player_Settings_Bloom_ThresholdInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`泛光阈值`)
};

/**
* | output |
* | --- |
* | "Bloom threshold" |
*
* @param {Player_Settings_Bloom_ThresholdInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_bloom_threshold = /** @type {((inputs?: Player_Settings_Bloom_ThresholdInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Settings_Bloom_ThresholdInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_settings_bloom_threshold(inputs)
	return en_player_settings_bloom_threshold(inputs)
});