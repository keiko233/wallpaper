/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_SettingsInputs */

const en_player_settings = /** @type {(inputs: Player_SettingsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Settings`)
};

const zh_player_settings = /** @type {(inputs: Player_SettingsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`设置`)
};

/**
* | output |
* | --- |
* | "Settings" |
*
* @param {Player_SettingsInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings = /** @type {((inputs?: Player_SettingsInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_SettingsInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_settings(inputs)
	return en_player_settings(inputs)
});