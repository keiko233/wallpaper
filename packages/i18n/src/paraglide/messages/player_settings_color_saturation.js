/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Settings_Color_SaturationInputs */

const en_player_settings_color_saturation = /** @type {(inputs: Player_Settings_Color_SaturationInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Color saturation`)
};

const zh_player_settings_color_saturation = /** @type {(inputs: Player_Settings_Color_SaturationInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`色彩饱和度`)
};

/**
* | output |
* | --- |
* | "Color saturation" |
*
* @param {Player_Settings_Color_SaturationInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_color_saturation = /** @type {((inputs?: Player_Settings_Color_SaturationInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Settings_Color_SaturationInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_settings_color_saturation(inputs)
	return en_player_settings_color_saturation(inputs)
});