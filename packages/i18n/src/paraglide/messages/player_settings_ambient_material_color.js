/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Settings_Ambient_Material_ColorInputs */

const en_player_settings_ambient_material_color = /** @type {(inputs: Player_Settings_Ambient_Material_ColorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ambient material color`)
};

const zh_player_settings_ambient_material_color = /** @type {(inputs: Player_Settings_Ambient_Material_ColorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`环境光材质颜色`)
};

/**
* | output |
* | --- |
* | "Ambient material color" |
*
* @param {Player_Settings_Ambient_Material_ColorInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_ambient_material_color = /** @type {((inputs?: Player_Settings_Ambient_Material_ColorInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Settings_Ambient_Material_ColorInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_settings_ambient_material_color(inputs)
	return en_player_settings_ambient_material_color(inputs)
});