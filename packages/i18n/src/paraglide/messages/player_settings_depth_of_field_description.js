/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Settings_Depth_Of_Field_DescriptionInputs */

const en_player_settings_depth_of_field_description = /** @type {(inputs: Player_Settings_Depth_Of_Field_DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Camera-focused blur inspired by ikBokeh and PowerDOF.`)
};

const zh_player_settings_depth_of_field_description = /** @type {(inputs: Player_Settings_Depth_Of_Field_DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`以相机为焦点的模糊效果，灵感来自 ikBokeh 和 PowerDOF。`)
};

/**
* | output |
* | --- |
* | "Camera-focused blur inspired by ikBokeh and PowerDOF." |
*
* @param {Player_Settings_Depth_Of_Field_DescriptionInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_depth_of_field_description = /** @type {((inputs?: Player_Settings_Depth_Of_Field_DescriptionInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Settings_Depth_Of_Field_DescriptionInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_settings_depth_of_field_description(inputs)
	return en_player_settings_depth_of_field_description(inputs)
});