/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Settings_Rendering_ModeInputs */

const en_player_settings_rendering_mode = /** @type {(inputs: Player_Settings_Rendering_ModeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Rendering mode`)
};

const zh_player_settings_rendering_mode = /** @type {(inputs: Player_Settings_Rendering_ModeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`渲染模式`)
};

/**
* | output |
* | --- |
* | "Rendering mode" |
*
* @param {Player_Settings_Rendering_ModeInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_rendering_mode = /** @type {((inputs?: Player_Settings_Rendering_ModeInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Settings_Rendering_ModeInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_settings_rendering_mode(inputs)
	return en_player_settings_rendering_mode(inputs)
});