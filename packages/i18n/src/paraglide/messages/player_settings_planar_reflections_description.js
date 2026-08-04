/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Settings_Planar_Reflections_DescriptionInputs */

const en_player_settings_planar_reflections_description = /** @type {(inputs: Player_Settings_Planar_Reflections_DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Renders stage-profile and WorkingFloor mirrors. This can be expensive on the GPU.`)
};

const zh_player_settings_planar_reflections_description = /** @type {(inputs: Player_Settings_Planar_Reflections_DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`渲染舞台轮廓和 WorkingFloor 镜面。这在 GPU 上可能开销较大。`)
};

/**
* | output |
* | --- |
* | "Renders stage-profile and WorkingFloor mirrors. This can be expensive on the GPU." |
*
* @param {Player_Settings_Planar_Reflections_DescriptionInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_planar_reflections_description = /** @type {((inputs?: Player_Settings_Planar_Reflections_DescriptionInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Settings_Planar_Reflections_DescriptionInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_settings_planar_reflections_description(inputs)
	return en_player_settings_planar_reflections_description(inputs)
});