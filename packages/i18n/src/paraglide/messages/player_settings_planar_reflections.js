/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Settings_Planar_ReflectionsInputs */

const en_player_settings_planar_reflections = /** @type {(inputs: Player_Settings_Planar_ReflectionsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Planar reflections`)
};

const zh_player_settings_planar_reflections = /** @type {(inputs: Player_Settings_Planar_ReflectionsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`平面反射`)
};

/**
* | output |
* | --- |
* | "Planar reflections" |
*
* @param {Player_Settings_Planar_ReflectionsInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_planar_reflections = /** @type {((inputs?: Player_Settings_Planar_ReflectionsInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Settings_Planar_ReflectionsInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_settings_planar_reflections(inputs)
	return en_player_settings_planar_reflections(inputs)
});