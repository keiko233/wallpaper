/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Settings_Current_CombinationInputs */

const en_player_settings_current_combination = /** @type {(inputs: Player_Settings_Current_CombinationInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Current combination`)
};

const zh_player_settings_current_combination = /** @type {(inputs: Player_Settings_Current_CombinationInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`当前组合`)
};

/**
* | output |
* | --- |
* | "Current combination" |
*
* @param {Player_Settings_Current_CombinationInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_current_combination = /** @type {((inputs?: Player_Settings_Current_CombinationInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Settings_Current_CombinationInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_settings_current_combination(inputs)
	return en_player_settings_current_combination(inputs)
});