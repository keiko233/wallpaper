/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Settings_Toon_Maps_DescriptionInputs */

const en_player_settings_toon_maps_description = /** @type {(inputs: Player_Settings_Toon_Maps_DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Enables the model's toon-ramp shading textures.`)
};

const zh_player_settings_toon_maps_description = /** @type {(inputs: Player_Settings_Toon_Maps_DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`启用模型的卡通渐变着色纹理。`)
};

/**
* | output |
* | --- |
* | "Enables the model's toon-ramp shading textures." |
*
* @param {Player_Settings_Toon_Maps_DescriptionInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_toon_maps_description = /** @type {((inputs?: Player_Settings_Toon_Maps_DescriptionInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Settings_Toon_Maps_DescriptionInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_settings_toon_maps_description(inputs)
	return en_player_settings_toon_maps_description(inputs)
});