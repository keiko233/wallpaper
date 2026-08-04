/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Settings_Sphere_MapsInputs */

const en_player_settings_sphere_maps = /** @type {(inputs: Player_Settings_Sphere_MapsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Sphere maps`)
};

const zh_player_settings_sphere_maps = /** @type {(inputs: Player_Settings_Sphere_MapsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`球体贴图`)
};

/**
* | output |
* | --- |
* | "Sphere maps" |
*
* @param {Player_Settings_Sphere_MapsInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_sphere_maps = /** @type {((inputs?: Player_Settings_Sphere_MapsInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Settings_Sphere_MapsInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_settings_sphere_maps(inputs)
	return en_player_settings_sphere_maps(inputs)
});