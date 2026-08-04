/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Settings_Shadow_OpacityInputs */

const en_player_settings_shadow_opacity = /** @type {(inputs: Player_Settings_Shadow_OpacityInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Shadow opacity`)
};

const zh_player_settings_shadow_opacity = /** @type {(inputs: Player_Settings_Shadow_OpacityInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`阴影不透明度`)
};

/**
* | output |
* | --- |
* | "Shadow opacity" |
*
* @param {Player_Settings_Shadow_OpacityInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_shadow_opacity = /** @type {((inputs?: Player_Settings_Shadow_OpacityInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Settings_Shadow_OpacityInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_settings_shadow_opacity(inputs)
	return en_player_settings_shadow_opacity(inputs)
});