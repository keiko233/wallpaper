/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Settings_Library_DescriptionInputs */

const en_player_settings_library_description = /** @type {(inputs: Player_Settings_Library_DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Browse and manage resources cached on this device.`)
};

const zh_player_settings_library_description = /** @type {(inputs: Player_Settings_Library_DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`浏览和管理缓存在本机上的资源。`)
};

/**
* | output |
* | --- |
* | "Browse and manage resources cached on this device." |
*
* @param {Player_Settings_Library_DescriptionInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_library_description = /** @type {((inputs?: Player_Settings_Library_DescriptionInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Settings_Library_DescriptionInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_settings_library_description(inputs)
	return en_player_settings_library_description(inputs)
});