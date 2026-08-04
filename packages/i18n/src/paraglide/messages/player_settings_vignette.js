/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Settings_VignetteInputs */

const en_player_settings_vignette = /** @type {(inputs: Player_Settings_VignetteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Vignette`)
};

const zh_player_settings_vignette = /** @type {(inputs: Player_Settings_VignetteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`暗角`)
};

/**
* | output |
* | --- |
* | "Vignette" |
*
* @param {Player_Settings_VignetteInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_vignette = /** @type {((inputs?: Player_Settings_VignetteInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Settings_VignetteInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_settings_vignette(inputs)
	return en_player_settings_vignette(inputs)
});