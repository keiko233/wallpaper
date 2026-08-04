/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Settings_Ambient_LightInputs */

const en_player_settings_ambient_light = /** @type {(inputs: Player_Settings_Ambient_LightInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ambient light`)
};

const zh_player_settings_ambient_light = /** @type {(inputs: Player_Settings_Ambient_LightInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`环境光`)
};

/**
* | output |
* | --- |
* | "Ambient light" |
*
* @param {Player_Settings_Ambient_LightInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_ambient_light = /** @type {((inputs?: Player_Settings_Ambient_LightInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Settings_Ambient_LightInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_settings_ambient_light(inputs)
	return en_player_settings_ambient_light(inputs)
});