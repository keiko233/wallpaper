/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Settings_Depth_Of_FieldInputs */

const en_player_settings_depth_of_field = /** @type {(inputs: Player_Settings_Depth_Of_FieldInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Depth of field`)
};

const zh_player_settings_depth_of_field = /** @type {(inputs: Player_Settings_Depth_Of_FieldInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`景深`)
};

/**
* | output |
* | --- |
* | "Depth of field" |
*
* @param {Player_Settings_Depth_Of_FieldInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_depth_of_field = /** @type {((inputs?: Player_Settings_Depth_Of_FieldInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Settings_Depth_Of_FieldInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_settings_depth_of_field(inputs)
	return en_player_settings_depth_of_field(inputs)
});