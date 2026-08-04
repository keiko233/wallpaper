/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Settings_Shadow_MapInputs */

const en_player_settings_shadow_map = /** @type {(inputs: Player_Settings_Shadow_MapInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Shadow map`)
};

const zh_player_settings_shadow_map = /** @type {(inputs: Player_Settings_Shadow_MapInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`阴影贴图`)
};

/**
* | output |
* | --- |
* | "Shadow map" |
*
* @param {Player_Settings_Shadow_MapInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_shadow_map = /** @type {((inputs?: Player_Settings_Shadow_MapInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Settings_Shadow_MapInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_settings_shadow_map(inputs)
	return en_player_settings_shadow_map(inputs)
});