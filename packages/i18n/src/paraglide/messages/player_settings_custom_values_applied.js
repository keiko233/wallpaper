/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Settings_Custom_Values_AppliedInputs */

const en_player_settings_custom_values_applied = /** @type {(inputs: Player_Settings_Custom_Values_AppliedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Custom values are currently applied.`)
};

const zh_player_settings_custom_values_applied = /** @type {(inputs: Player_Settings_Custom_Values_AppliedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`当前正在应用自定义数值。`)
};

/**
* | output |
* | --- |
* | "Custom values are currently applied." |
*
* @param {Player_Settings_Custom_Values_AppliedInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_custom_values_applied = /** @type {((inputs?: Player_Settings_Custom_Values_AppliedInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Settings_Custom_Values_AppliedInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_settings_custom_values_applied(inputs)
	return en_player_settings_custom_values_applied(inputs)
});