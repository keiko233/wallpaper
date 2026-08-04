/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Settings_Quality_LowInputs */

const en_player_settings_quality_low = /** @type {(inputs: Player_Settings_Quality_LowInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Low`)
};

const zh_player_settings_quality_low = /** @type {(inputs: Player_Settings_Quality_LowInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`低`)
};

/**
* | output |
* | --- |
* | "Low" |
*
* @param {Player_Settings_Quality_LowInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_quality_low = /** @type {((inputs?: Player_Settings_Quality_LowInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Settings_Quality_LowInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_settings_quality_low(inputs)
	return en_player_settings_quality_low(inputs)
});