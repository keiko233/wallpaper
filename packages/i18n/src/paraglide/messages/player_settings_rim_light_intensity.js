/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Settings_Rim_Light_IntensityInputs */

const en_player_settings_rim_light_intensity = /** @type {(inputs: Player_Settings_Rim_Light_IntensityInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Rim light intensity`)
};

const zh_player_settings_rim_light_intensity = /** @type {(inputs: Player_Settings_Rim_Light_IntensityInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`轮廓光强度`)
};

/**
* | output |
* | --- |
* | "Rim light intensity" |
*
* @param {Player_Settings_Rim_Light_IntensityInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_rim_light_intensity = /** @type {((inputs?: Player_Settings_Rim_Light_IntensityInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Settings_Rim_Light_IntensityInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_settings_rim_light_intensity(inputs)
	return en_player_settings_rim_light_intensity(inputs)
});