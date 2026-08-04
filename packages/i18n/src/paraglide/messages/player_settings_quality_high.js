/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Settings_Quality_HighInputs */

const en_player_settings_quality_high = /** @type {(inputs: Player_Settings_Quality_HighInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`High`)
};

const zh_player_settings_quality_high = /** @type {(inputs: Player_Settings_Quality_HighInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`高`)
};

/**
* | output |
* | --- |
* | "High" |
*
* @param {Player_Settings_Quality_HighInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_quality_high = /** @type {((inputs?: Player_Settings_Quality_HighInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Settings_Quality_HighInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_settings_quality_high(inputs)
	return en_player_settings_quality_high(inputs)
});