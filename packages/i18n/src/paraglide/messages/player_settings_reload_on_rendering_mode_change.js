/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Settings_Reload_On_Rendering_Mode_ChangeInputs */

const en_player_settings_reload_on_rendering_mode_change = /** @type {(inputs: Player_Settings_Reload_On_Rendering_Mode_ChangeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Changing this option reloads the current model.`)
};

const zh_player_settings_reload_on_rendering_mode_change = /** @type {(inputs: Player_Settings_Reload_On_Rendering_Mode_ChangeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`更改此选项会重新加载当前模型。`)
};

/**
* | output |
* | --- |
* | "Changing this option reloads the current model." |
*
* @param {Player_Settings_Reload_On_Rendering_Mode_ChangeInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_reload_on_rendering_mode_change = /** @type {((inputs?: Player_Settings_Reload_On_Rendering_Mode_ChangeInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Settings_Reload_On_Rendering_Mode_ChangeInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_settings_reload_on_rendering_mode_change(inputs)
	return en_player_settings_reload_on_rendering_mode_change(inputs)
});