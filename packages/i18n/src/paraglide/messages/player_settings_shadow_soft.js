/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Settings_Shadow_SoftInputs */

const en_player_settings_shadow_soft = /** @type {(inputs: Player_Settings_Shadow_SoftInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Soft (PCSS)`)
};

const zh_player_settings_shadow_soft = /** @type {(inputs: Player_Settings_Shadow_SoftInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`柔和 (PCSS)`)
};

/**
* | output |
* | --- |
* | "Soft (PCSS)" |
*
* @param {Player_Settings_Shadow_SoftInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_shadow_soft = /** @type {((inputs?: Player_Settings_Shadow_SoftInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Settings_Shadow_SoftInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_settings_shadow_soft(inputs)
	return en_player_settings_shadow_soft(inputs)
});