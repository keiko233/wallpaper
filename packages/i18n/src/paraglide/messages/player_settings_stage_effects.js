/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Settings_Stage_EffectsInputs */

const en_player_settings_stage_effects = /** @type {(inputs: Player_Settings_Stage_EffectsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Stage effects`)
};

const zh_player_settings_stage_effects = /** @type {(inputs: Player_Settings_Stage_EffectsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`舞台特效`)
};

/**
* | output |
* | --- |
* | "Stage effects" |
*
* @param {Player_Settings_Stage_EffectsInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_stage_effects = /** @type {((inputs?: Player_Settings_Stage_EffectsInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Settings_Stage_EffectsInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_settings_stage_effects(inputs)
	return en_player_settings_stage_effects(inputs)
});