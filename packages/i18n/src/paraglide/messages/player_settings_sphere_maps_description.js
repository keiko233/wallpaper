/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Settings_Sphere_Maps_DescriptionInputs */

const en_player_settings_sphere_maps_description = /** @type {(inputs: Player_Settings_Sphere_Maps_DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Enables sphere maps used for metallic and glossy highlights.`)
};

const zh_player_settings_sphere_maps_description = /** @type {(inputs: Player_Settings_Sphere_Maps_DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`启用用于金属和高光光泽的球体贴图。`)
};

/**
* | output |
* | --- |
* | "Enables sphere maps used for metallic and glossy highlights." |
*
* @param {Player_Settings_Sphere_Maps_DescriptionInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_sphere_maps_description = /** @type {((inputs?: Player_Settings_Sphere_Maps_DescriptionInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Settings_Sphere_Maps_DescriptionInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_settings_sphere_maps_description(inputs)
	return en_player_settings_sphere_maps_description(inputs)
});