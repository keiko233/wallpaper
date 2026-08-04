/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Settings_Fxaa_DescriptionInputs */

const en_player_settings_fxaa_description = /** @type {(inputs: Player_Settings_Fxaa_DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Fast post-process filter that smooths remaining jagged edges after MSAA.`)
};

const zh_player_settings_fxaa_description = /** @type {(inputs: Player_Settings_Fxaa_DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`在 MSAA 之后平滑残余锯齿边缘的快速后期滤镜。`)
};

/**
* | output |
* | --- |
* | "Fast post-process filter that smooths remaining jagged edges after MSAA." |
*
* @param {Player_Settings_Fxaa_DescriptionInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_fxaa_description = /** @type {((inputs?: Player_Settings_Fxaa_DescriptionInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Settings_Fxaa_DescriptionInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_settings_fxaa_description(inputs)
	return en_player_settings_fxaa_description(inputs)
});