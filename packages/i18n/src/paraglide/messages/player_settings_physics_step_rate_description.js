/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Settings_Physics_Step_Rate_DescriptionInputs */

const en_player_settings_physics_step_rate_description = /** @type {(inputs: Player_Settings_Physics_Step_Rate_DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Higher rates simulate hair and skirts more smoothly at a CPU cost.`)
};

const zh_player_settings_physics_step_rate_description = /** @type {(inputs: Player_Settings_Physics_Step_Rate_DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`更高的频率让头发和裙摆模拟更平滑，但会消耗更多 CPU。`)
};

/**
* | output |
* | --- |
* | "Higher rates simulate hair and skirts more smoothly at a CPU cost." |
*
* @param {Player_Settings_Physics_Step_Rate_DescriptionInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_physics_step_rate_description = /** @type {((inputs?: Player_Settings_Physics_Step_Rate_DescriptionInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Settings_Physics_Step_Rate_DescriptionInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_settings_physics_step_rate_description(inputs)
	return en_player_settings_physics_step_rate_description(inputs)
});