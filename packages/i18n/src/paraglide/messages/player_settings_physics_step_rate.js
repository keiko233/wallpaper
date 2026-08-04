/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Settings_Physics_Step_RateInputs */

const en_player_settings_physics_step_rate = /** @type {(inputs: Player_Settings_Physics_Step_RateInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Physics step rate`)
};

const zh_player_settings_physics_step_rate = /** @type {(inputs: Player_Settings_Physics_Step_RateInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`物理步进频率`)
};

/**
* | output |
* | --- |
* | "Physics step rate" |
*
* @param {Player_Settings_Physics_Step_RateInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_physics_step_rate = /** @type {((inputs?: Player_Settings_Physics_Step_RateInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Settings_Physics_Step_RateInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_settings_physics_step_rate(inputs)
	return en_player_settings_physics_step_rate(inputs)
});