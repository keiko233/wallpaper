/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Settings_Stage_Effects_DescriptionInputs */

const en_player_settings_stage_effects_description = /** @type {(inputs: Player_Settings_Stage_Effects_DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Applies the stage's built-in material, lighting, emissive, and bloom tuning.`)
};

const zh_player_settings_stage_effects_description = /** @type {(inputs: Player_Settings_Stage_Effects_DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`应用舞台内置的材质、光照、自发光和泛光调节。`)
};

/**
* | output |
* | --- |
* | "Applies the stage's built-in material, lighting, emissive, and bloom tuning." |
*
* @param {Player_Settings_Stage_Effects_DescriptionInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_stage_effects_description = /** @type {((inputs?: Player_Settings_Stage_Effects_DescriptionInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Settings_Stage_Effects_DescriptionInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_settings_stage_effects_description(inputs)
	return en_player_settings_stage_effects_description(inputs)
});