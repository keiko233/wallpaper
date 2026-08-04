/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Settings_Physics_Joint_LimitInputs */

const en_player_settings_physics_joint_limit = /** @type {(inputs: Player_Settings_Physics_Joint_LimitInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Physics joint limit`)
};

const zh_player_settings_physics_joint_limit = /** @type {(inputs: Player_Settings_Physics_Joint_LimitInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`物理关节角度限制`)
};

/**
* | output |
* | --- |
* | "Physics joint limit" |
*
* @param {Player_Settings_Physics_Joint_LimitInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_physics_joint_limit = /** @type {((inputs?: Player_Settings_Physics_Joint_LimitInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Settings_Physics_Joint_LimitInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_settings_physics_joint_limit(inputs)
	return en_player_settings_physics_joint_limit(inputs)
});