/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Settings_Ambient_Occlusion_DescriptionInputs */

const en_player_settings_ambient_occlusion_description = /** @type {(inputs: Player_Settings_Ambient_Occlusion_DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Darkens crevices between hair, clothes and body for depth.`)
};

const zh_player_settings_ambient_occlusion_description = /** @type {(inputs: Player_Settings_Ambient_Occlusion_DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`压暗头发、衣物与身体之间的缝隙以增强立体感。`)
};

/**
* | output |
* | --- |
* | "Darkens crevices between hair, clothes and body for depth." |
*
* @param {Player_Settings_Ambient_Occlusion_DescriptionInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_ambient_occlusion_description = /** @type {((inputs?: Player_Settings_Ambient_Occlusion_DescriptionInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Settings_Ambient_Occlusion_DescriptionInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_settings_ambient_occlusion_description(inputs)
	return en_player_settings_ambient_occlusion_description(inputs)
});