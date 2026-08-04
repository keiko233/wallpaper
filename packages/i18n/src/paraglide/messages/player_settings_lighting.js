/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Settings_LightingInputs */

const en_player_settings_lighting = /** @type {(inputs: Player_Settings_LightingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Lighting`)
};

const zh_player_settings_lighting = /** @type {(inputs: Player_Settings_LightingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`光照`)
};

/**
* | output |
* | --- |
* | "Lighting" |
*
* @param {Player_Settings_LightingInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_lighting = /** @type {((inputs?: Player_Settings_LightingInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Settings_LightingInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_settings_lighting(inputs)
	return en_player_settings_lighting(inputs)
});