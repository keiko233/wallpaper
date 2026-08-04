/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Settings_ContrastInputs */

const en_player_settings_contrast = /** @type {(inputs: Player_Settings_ContrastInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Contrast`)
};

const zh_player_settings_contrast = /** @type {(inputs: Player_Settings_ContrastInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`对比度`)
};

/**
* | output |
* | --- |
* | "Contrast" |
*
* @param {Player_Settings_ContrastInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_contrast = /** @type {((inputs?: Player_Settings_ContrastInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Settings_ContrastInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_settings_contrast(inputs)
	return en_player_settings_contrast(inputs)
});