/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Settings_Rim_Light_DescriptionInputs */

const en_player_settings_rim_light_description = /** @type {(inputs: Player_Settings_Rim_Light_DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Faint cool back light that separates the model from the background.`)
};

const zh_player_settings_rim_light_description = /** @type {(inputs: Player_Settings_Rim_Light_DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`淡淡的冷色背光，将模型与背景区分开。`)
};

/**
* | output |
* | --- |
* | "Faint cool back light that separates the model from the background." |
*
* @param {Player_Settings_Rim_Light_DescriptionInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_rim_light_description = /** @type {((inputs?: Player_Settings_Rim_Light_DescriptionInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Settings_Rim_Light_DescriptionInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_settings_rim_light_description(inputs)
	return en_player_settings_rim_light_description(inputs)
});