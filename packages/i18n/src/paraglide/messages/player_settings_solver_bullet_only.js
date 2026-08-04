/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Settings_Solver_Bullet_OnlyInputs */

const en_player_settings_solver_bullet_only = /** @type {(inputs: Player_Settings_Solver_Bullet_OnlyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Only available with the Bullet engine.`)
};

const zh_player_settings_solver_bullet_only = /** @type {(inputs: Player_Settings_Solver_Bullet_OnlyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`仅在 Bullet 引擎下可用。`)
};

/**
* | output |
* | --- |
* | "Only available with the Bullet engine." |
*
* @param {Player_Settings_Solver_Bullet_OnlyInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_solver_bullet_only = /** @type {((inputs?: Player_Settings_Solver_Bullet_OnlyInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Settings_Solver_Bullet_OnlyInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_settings_solver_bullet_only(inputs)
	return en_player_settings_solver_bullet_only(inputs)
});