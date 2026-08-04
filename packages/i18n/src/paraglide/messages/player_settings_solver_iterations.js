/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Settings_Solver_IterationsInputs */

const en_player_settings_solver_iterations = /** @type {(inputs: Player_Settings_Solver_IterationsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Solver iterations`)
};

const zh_player_settings_solver_iterations = /** @type {(inputs: Player_Settings_Solver_IterationsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`求解迭代次数`)
};

/**
* | output |
* | --- |
* | "Solver iterations" |
*
* @param {Player_Settings_Solver_IterationsInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_solver_iterations = /** @type {((inputs?: Player_Settings_Solver_IterationsInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Settings_Solver_IterationsInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_settings_solver_iterations(inputs)
	return en_player_settings_solver_iterations(inputs)
});