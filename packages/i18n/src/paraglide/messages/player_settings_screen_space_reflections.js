/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Settings_Screen_Space_ReflectionsInputs */

const en_player_settings_screen_space_reflections = /** @type {(inputs: Player_Settings_Screen_Space_ReflectionsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Screen-space reflections (SSR)`)
};

const zh_player_settings_screen_space_reflections = /** @type {(inputs: Player_Settings_Screen_Space_ReflectionsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`屏幕空间反射 (SSR)`)
};

/**
* | output |
* | --- |
* | "Screen-space reflections (SSR)" |
*
* @param {Player_Settings_Screen_Space_ReflectionsInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_screen_space_reflections = /** @type {((inputs?: Player_Settings_Screen_Space_ReflectionsInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Settings_Screen_Space_ReflectionsInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_settings_screen_space_reflections(inputs)
	return en_player_settings_screen_space_reflections(inputs)
});