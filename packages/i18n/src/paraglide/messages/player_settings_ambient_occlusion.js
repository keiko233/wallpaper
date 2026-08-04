/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Settings_Ambient_OcclusionInputs */

const en_player_settings_ambient_occlusion = /** @type {(inputs: Player_Settings_Ambient_OcclusionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ambient occlusion (SSAO)`)
};

const zh_player_settings_ambient_occlusion = /** @type {(inputs: Player_Settings_Ambient_OcclusionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`环境光遮蔽 (SSAO)`)
};

/**
* | output |
* | --- |
* | "Ambient occlusion (SSAO)" |
*
* @param {Player_Settings_Ambient_OcclusionInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_ambient_occlusion = /** @type {((inputs?: Player_Settings_Ambient_OcclusionInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Settings_Ambient_OcclusionInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_settings_ambient_occlusion(inputs)
	return en_player_settings_ambient_occlusion(inputs)
});