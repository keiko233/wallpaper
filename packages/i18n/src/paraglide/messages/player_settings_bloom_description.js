/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Settings_Bloom_DescriptionInputs */

const en_player_settings_bloom_description = /** @type {(inputs: Player_Settings_Bloom_DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Soft glow around bright highlights, similar to AutoLuminous.`)
};

const zh_player_settings_bloom_description = /** @type {(inputs: Player_Settings_Bloom_DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`高光周围的柔和光晕，类似于 AutoLuminous。`)
};

/**
* | output |
* | --- |
* | "Soft glow around bright highlights, similar to AutoLuminous." |
*
* @param {Player_Settings_Bloom_DescriptionInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_bloom_description = /** @type {((inputs?: Player_Settings_Bloom_DescriptionInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Settings_Bloom_DescriptionInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_settings_bloom_description(inputs)
	return en_player_settings_bloom_description(inputs)
});