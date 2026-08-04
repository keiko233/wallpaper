/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Settings_Mirror_ResolutionInputs */

const en_player_settings_mirror_resolution = /** @type {(inputs: Player_Settings_Mirror_ResolutionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Mirror resolution`)
};

const zh_player_settings_mirror_resolution = /** @type {(inputs: Player_Settings_Mirror_ResolutionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`镜面分辨率`)
};

/**
* | output |
* | --- |
* | "Mirror resolution" |
*
* @param {Player_Settings_Mirror_ResolutionInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_mirror_resolution = /** @type {((inputs?: Player_Settings_Mirror_ResolutionInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Settings_Mirror_ResolutionInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_settings_mirror_resolution(inputs)
	return en_player_settings_mirror_resolution(inputs)
});