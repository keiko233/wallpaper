/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ level: NonNullable<unknown> }} Player_Settings_AnisotropicInputs */

const en_player_settings_anisotropic = /** @type {(inputs: Player_Settings_AnisotropicInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.level}× anisotropic`)
};

const zh_player_settings_anisotropic = /** @type {(inputs: Player_Settings_AnisotropicInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.level} 倍各向异性`)
};

/**
* | output |
* | --- |
* | "{level}× anisotropic" |
*
* @param {Player_Settings_AnisotropicInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_anisotropic = /** @type {((inputs: Player_Settings_AnisotropicInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Settings_AnisotropicInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_settings_anisotropic(inputs)
	return en_player_settings_anisotropic(inputs)
});