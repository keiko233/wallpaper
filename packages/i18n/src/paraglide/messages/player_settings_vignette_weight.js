/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Settings_Vignette_WeightInputs */

const en_player_settings_vignette_weight = /** @type {(inputs: Player_Settings_Vignette_WeightInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Vignette weight`)
};

const zh_player_settings_vignette_weight = /** @type {(inputs: Player_Settings_Vignette_WeightInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`暗角强度`)
};

/**
* | output |
* | --- |
* | "Vignette weight" |
*
* @param {Player_Settings_Vignette_WeightInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_vignette_weight = /** @type {((inputs?: Player_Settings_Vignette_WeightInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Settings_Vignette_WeightInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_settings_vignette_weight(inputs)
	return en_player_settings_vignette_weight(inputs)
});