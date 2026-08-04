/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Settings_Mme_Effects_DescriptionInputs */

const en_player_settings_mme_effects_description = /** @type {(inputs: Player_Settings_Mme_Effects_DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Browser-native versions of common MME post effects.`)
};

const zh_player_settings_mme_effects_description = /** @type {(inputs: Player_Settings_Mme_Effects_DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`常见 MME 后期特效的浏览器原生实现。`)
};

/**
* | output |
* | --- |
* | "Browser-native versions of common MME post effects." |
*
* @param {Player_Settings_Mme_Effects_DescriptionInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_mme_effects_description = /** @type {((inputs?: Player_Settings_Mme_Effects_DescriptionInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Settings_Mme_Effects_DescriptionInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_settings_mme_effects_description(inputs)
	return en_player_settings_mme_effects_description(inputs)
});