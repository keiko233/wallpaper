/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ model: NonNullable<unknown>, stage: NonNullable<unknown>, skybox: NonNullable<unknown> }} Player_Sr_Only_CombinationInputs */

const en_player_sr_only_combination = /** @type {(inputs: Player_Sr_Only_CombinationInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Model: ${i?.model}. Stage: ${i?.stage}. Skybox: ${i?.skybox}.`)
};

const zh_player_sr_only_combination = /** @type {(inputs: Player_Sr_Only_CombinationInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`模型：${i?.model}。舞台：${i?.stage}。天空盒：${i?.skybox}。`)
};

/**
* | output |
* | --- |
* | "Model: {model}. Stage: {stage}. Skybox: {skybox}." |
*
* @param {Player_Sr_Only_CombinationInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_sr_only_combination = /** @type {((inputs: Player_Sr_Only_CombinationInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Sr_Only_CombinationInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_sr_only_combination(inputs)
	return en_player_sr_only_combination(inputs)
});