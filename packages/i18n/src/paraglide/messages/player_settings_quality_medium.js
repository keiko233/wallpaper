/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Settings_Quality_MediumInputs */

const en_player_settings_quality_medium = /** @type {(inputs: Player_Settings_Quality_MediumInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Medium`)
};

const zh_player_settings_quality_medium = /** @type {(inputs: Player_Settings_Quality_MediumInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`中`)
};

/**
* | output |
* | --- |
* | "Medium" |
*
* @param {Player_Settings_Quality_MediumInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_quality_medium = /** @type {((inputs?: Player_Settings_Quality_MediumInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Settings_Quality_MediumInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_settings_quality_medium(inputs)
	return en_player_settings_quality_medium(inputs)
});