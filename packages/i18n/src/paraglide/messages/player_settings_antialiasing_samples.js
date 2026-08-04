/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Settings_Antialiasing_SamplesInputs */

const en_player_settings_antialiasing_samples = /** @type {(inputs: Player_Settings_Antialiasing_SamplesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Antialiasing samples`)
};

const zh_player_settings_antialiasing_samples = /** @type {(inputs: Player_Settings_Antialiasing_SamplesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`抗锯齿采样`)
};

/**
* | output |
* | --- |
* | "Antialiasing samples" |
*
* @param {Player_Settings_Antialiasing_SamplesInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_antialiasing_samples = /** @type {((inputs?: Player_Settings_Antialiasing_SamplesInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Settings_Antialiasing_SamplesInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_settings_antialiasing_samples(inputs)
	return en_player_settings_antialiasing_samples(inputs)
});