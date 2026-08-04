/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Settings_Physics_Strength_DescriptionInputs */

const en_player_settings_physics_strength_description = /** @type {(inputs: Player_Settings_Physics_Strength_DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Stiffness of the model's joints; below 1 makes hair and skirts softer, above 1 stiffer. Changing this value reloads the current resources.`)
};

const zh_player_settings_physics_strength_description = /** @type {(inputs: Player_Settings_Physics_Strength_DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`模型关节的刚度；低于 1 时头发和裙摆更柔软，高于 1 时更僵硬。更改此值会重新加载当前资源。`)
};

/**
* | output |
* | --- |
* | "Stiffness of the model's joints; below 1 makes hair and skirts softer, above 1 stiffer. Changing this value reloads the current resources." |
*
* @param {Player_Settings_Physics_Strength_DescriptionInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_physics_strength_description = /** @type {((inputs?: Player_Settings_Physics_Strength_DescriptionInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Settings_Physics_Strength_DescriptionInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_settings_physics_strength_description(inputs)
	return en_player_settings_physics_strength_description(inputs)
});