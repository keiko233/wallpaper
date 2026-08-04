/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Settings_Solver_Iterations_DescriptionInputs */

const en_player_settings_solver_iterations_description = /** @type {(inputs: Player_Settings_Solver_Iterations_DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`More iterations resolve clipping between hair, clothes and skin more reliably.`)
};

const zh_player_settings_solver_iterations_description = /** @type {(inputs: Player_Settings_Solver_Iterations_DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`更多迭代能更可靠地解决头发、衣物与皮肤之间的穿插。`)
};

/**
* | output |
* | --- |
* | "More iterations resolve clipping between hair, clothes and skin more reliably." |
*
* @param {Player_Settings_Solver_Iterations_DescriptionInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_solver_iterations_description = /** @type {((inputs?: Player_Settings_Solver_Iterations_DescriptionInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Settings_Solver_Iterations_DescriptionInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_settings_solver_iterations_description(inputs)
	return en_player_settings_solver_iterations_description(inputs)
});