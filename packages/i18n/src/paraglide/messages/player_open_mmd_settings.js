/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Open_Mmd_SettingsInputs */

const en_player_open_mmd_settings = /** @type {(inputs: Player_Open_Mmd_SettingsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Open MMD settings`)
};

const zh_player_open_mmd_settings = /** @type {(inputs: Player_Open_Mmd_SettingsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`打开 MMD 设置`)
};

/**
* | output |
* | --- |
* | "Open MMD settings" |
*
* @param {Player_Open_Mmd_SettingsInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_open_mmd_settings = /** @type {((inputs?: Player_Open_Mmd_SettingsInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Open_Mmd_SettingsInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_open_mmd_settings(inputs)
	return en_player_open_mmd_settings(inputs)
});