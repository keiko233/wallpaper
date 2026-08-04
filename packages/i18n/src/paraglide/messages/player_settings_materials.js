/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Settings_MaterialsInputs */

const en_player_settings_materials = /** @type {(inputs: Player_Settings_MaterialsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Materials`)
};

const zh_player_settings_materials = /** @type {(inputs: Player_Settings_MaterialsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`材质`)
};

/**
* | output |
* | --- |
* | "Materials" |
*
* @param {Player_Settings_MaterialsInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_materials = /** @type {((inputs?: Player_Settings_MaterialsInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Settings_MaterialsInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_settings_materials(inputs)
	return en_player_settings_materials(inputs)
});