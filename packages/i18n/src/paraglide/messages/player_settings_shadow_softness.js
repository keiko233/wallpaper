/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Settings_Shadow_SoftnessInputs */

const en_player_settings_shadow_softness = /** @type {(inputs: Player_Settings_Shadow_SoftnessInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Shadow softness`)
};

const zh_player_settings_shadow_softness = /** @type {(inputs: Player_Settings_Shadow_SoftnessInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`阴影柔和度`)
};

/**
* | output |
* | --- |
* | "Shadow softness" |
*
* @param {Player_Settings_Shadow_SoftnessInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_shadow_softness = /** @type {((inputs?: Player_Settings_Shadow_SoftnessInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Settings_Shadow_SoftnessInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_settings_shadow_softness(inputs)
	return en_player_settings_shadow_softness(inputs)
});