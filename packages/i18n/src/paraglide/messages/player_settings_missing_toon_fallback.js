/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Settings_Missing_Toon_FallbackInputs */

const en_player_settings_missing_toon_fallback = /** @type {(inputs: Player_Settings_Missing_Toon_FallbackInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Missing toon fallback`)
};

const zh_player_settings_missing_toon_fallback = /** @type {(inputs: Player_Settings_Missing_Toon_FallbackInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`缺少卡通纹理回退`)
};

/**
* | output |
* | --- |
* | "Missing toon fallback" |
*
* @param {Player_Settings_Missing_Toon_FallbackInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_missing_toon_fallback = /** @type {((inputs?: Player_Settings_Missing_Toon_FallbackInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Settings_Missing_Toon_FallbackInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_settings_missing_toon_fallback(inputs)
	return en_player_settings_missing_toon_fallback(inputs)
});