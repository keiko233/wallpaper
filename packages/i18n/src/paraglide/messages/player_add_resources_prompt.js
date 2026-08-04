/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Add_Resources_PromptInputs */

const en_player_add_resources_prompt = /** @type {(inputs: Player_Add_Resources_PromptInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Add a model, motion, stage, and skybox option to begin.`)
};

const zh_player_add_resources_prompt = /** @type {(inputs: Player_Add_Resources_PromptInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`请添加模型、动作、舞台和天空盒以开始。`)
};

/**
* | output |
* | --- |
* | "Add a model, motion, stage, and skybox option to begin." |
*
* @param {Player_Add_Resources_PromptInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_add_resources_prompt = /** @type {((inputs?: Player_Add_Resources_PromptInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Add_Resources_PromptInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_add_resources_prompt(inputs)
	return en_player_add_resources_prompt(inputs)
});