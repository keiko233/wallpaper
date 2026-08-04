/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Settings_Missing_Toon_Fallback_DescriptionInputs */

const en_player_settings_missing_toon_fallback_description = /** @type {(inputs: Player_Settings_Missing_Toon_Fallback_DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Keeps materials without a toon texture from becoming too dark.`)
};

const zh_player_settings_missing_toon_fallback_description = /** @type {(inputs: Player_Settings_Missing_Toon_Fallback_DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`防止没有卡通纹理的材质变得过暗。`)
};

/**
* | output |
* | --- |
* | "Keeps materials without a toon texture from becoming too dark." |
*
* @param {Player_Settings_Missing_Toon_Fallback_DescriptionInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_missing_toon_fallback_description = /** @type {((inputs?: Player_Settings_Missing_Toon_Fallback_DescriptionInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Settings_Missing_Toon_Fallback_DescriptionInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_settings_missing_toon_fallback_description(inputs)
	return en_player_settings_missing_toon_fallback_description(inputs)
});