/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Settings_Shadow_CrispInputs */

const en_player_settings_shadow_crisp = /** @type {(inputs: Player_Settings_Shadow_CrispInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Crisp (PCF)`)
};

const zh_player_settings_shadow_crisp = /** @type {(inputs: Player_Settings_Shadow_CrispInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`锐利 (PCF)`)
};

/**
* | output |
* | --- |
* | "Crisp (PCF)" |
*
* @param {Player_Settings_Shadow_CrispInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_shadow_crisp = /** @type {((inputs?: Player_Settings_Shadow_CrispInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Settings_Shadow_CrispInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_settings_shadow_crisp(inputs)
	return en_player_settings_shadow_crisp(inputs)
});