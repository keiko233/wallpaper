/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Settings_Key_Light_ColorInputs */

const en_player_settings_key_light_color = /** @type {(inputs: Player_Settings_Key_Light_ColorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Key light color`)
};

const zh_player_settings_key_light_color = /** @type {(inputs: Player_Settings_Key_Light_ColorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`主光颜色`)
};

/**
* | output |
* | --- |
* | "Key light color" |
*
* @param {Player_Settings_Key_Light_ColorInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_key_light_color = /** @type {((inputs?: Player_Settings_Key_Light_ColorInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Settings_Key_Light_ColorInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_settings_key_light_color(inputs)
	return en_player_settings_key_light_color(inputs)
});