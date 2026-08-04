/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Settings_Render_Quality_DescriptionInputs */

const en_player_settings_render_quality_description = /** @type {(inputs: Player_Settings_Render_Quality_DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Presets balance visual fidelity against GPU cost. Advanced options tune each effect individually.`)
};

const zh_player_settings_render_quality_description = /** @type {(inputs: Player_Settings_Render_Quality_DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`预设可在画面保真度与 GPU 开销之间取得平衡，高级选项可逐项微调每个特效。`)
};

/**
* | output |
* | --- |
* | "Presets balance visual fidelity against GPU cost. Advanced options tune each effect individually." |
*
* @param {Player_Settings_Render_Quality_DescriptionInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_render_quality_description = /** @type {((inputs?: Player_Settings_Render_Quality_DescriptionInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Settings_Render_Quality_DescriptionInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_settings_render_quality_description(inputs)
	return en_player_settings_render_quality_description(inputs)
});