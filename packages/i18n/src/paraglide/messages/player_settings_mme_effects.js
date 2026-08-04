/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Settings_Mme_EffectsInputs */

const en_player_settings_mme_effects = /** @type {(inputs: Player_Settings_Mme_EffectsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`MME effects`)
};

const zh_player_settings_mme_effects = /** @type {(inputs: Player_Settings_Mme_EffectsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`MME 特效`)
};

/**
* | output |
* | --- |
* | "MME effects" |
*
* @param {Player_Settings_Mme_EffectsInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_mme_effects = /** @type {((inputs?: Player_Settings_Mme_EffectsInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Settings_Mme_EffectsInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_settings_mme_effects(inputs)
	return en_player_settings_mme_effects(inputs)
});