/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Settings_Reload_On_ChangeInputs */

const en_player_settings_reload_on_change = /** @type {(inputs: Player_Settings_Reload_On_ChangeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Changing this option reloads the current resources.`)
};

const zh_player_settings_reload_on_change = /** @type {(inputs: Player_Settings_Reload_On_ChangeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`更改此选项会重新加载当前资源。`)
};

/**
* | output |
* | --- |
* | "Changing this option reloads the current resources." |
*
* @param {Player_Settings_Reload_On_ChangeInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_reload_on_change = /** @type {((inputs?: Player_Settings_Reload_On_ChangeInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Settings_Reload_On_ChangeInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_settings_reload_on_change(inputs)
	return en_player_settings_reload_on_change(inputs)
});