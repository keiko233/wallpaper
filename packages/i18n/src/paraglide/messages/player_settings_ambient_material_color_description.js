/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Settings_Ambient_Material_Color_DescriptionInputs */

const en_player_settings_ambient_material_color_description = /** @type {(inputs: Player_Settings_Ambient_Material_Color_DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Uses the model's ambient color in the final diffuse color.`)
};

const zh_player_settings_ambient_material_color_description = /** @type {(inputs: Player_Settings_Ambient_Material_Color_DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`在最终漫反射颜色中使用模型的环境光颜色。`)
};

/**
* | output |
* | --- |
* | "Uses the model's ambient color in the final diffuse color." |
*
* @param {Player_Settings_Ambient_Material_Color_DescriptionInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_ambient_material_color_description = /** @type {((inputs?: Player_Settings_Ambient_Material_Color_DescriptionInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Settings_Ambient_Material_Color_DescriptionInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_settings_ambient_material_color_description(inputs)
	return en_player_settings_ambient_material_color_description(inputs)
});