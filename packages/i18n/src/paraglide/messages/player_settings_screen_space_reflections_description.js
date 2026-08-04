/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Settings_Screen_Space_Reflections_DescriptionInputs */

const en_player_settings_screen_space_reflections_description = /** @type {(inputs: Player_Settings_Screen_Space_Reflections_DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Screen-space reflections on glossy surfaces. Experimental with MMD toon materials; best on reflective stages.`)
};

const zh_player_settings_screen_space_reflections_description = /** @type {(inputs: Player_Settings_Screen_Space_Reflections_DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`光泽表面上的屏幕空间反射。与 MMD 卡通材质配合时属于实验特性；在反射性舞台上效果最佳。`)
};

/**
* | output |
* | --- |
* | "Screen-space reflections on glossy surfaces. Experimental with MMD toon materials; best on reflective stages." |
*
* @param {Player_Settings_Screen_Space_Reflections_DescriptionInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_screen_space_reflections_description = /** @type {((inputs?: Player_Settings_Screen_Space_Reflections_DescriptionInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Settings_Screen_Space_Reflections_DescriptionInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_settings_screen_space_reflections_description(inputs)
	return en_player_settings_screen_space_reflections_description(inputs)
});