/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Settings_Key_LightInputs */

const en_player_settings_key_light = /** @type {(inputs: Player_Settings_Key_LightInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Key light`)
};

const zh_player_settings_key_light = /** @type {(inputs: Player_Settings_Key_LightInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`主光`)
};

/**
* | output |
* | --- |
* | "Key light" |
*
* @param {Player_Settings_Key_LightInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_key_light = /** @type {((inputs?: Player_Settings_Key_LightInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Settings_Key_LightInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_settings_key_light(inputs)
	return en_player_settings_key_light(inputs)
});