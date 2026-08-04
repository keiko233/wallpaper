/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Settings_LibraryInputs */

const en_player_settings_library = /** @type {(inputs: Player_Settings_LibraryInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Library`)
};

const zh_player_settings_library = /** @type {(inputs: Player_Settings_LibraryInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`资源库`)
};

/**
* | output |
* | --- |
* | "Library" |
*
* @param {Player_Settings_LibraryInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_library = /** @type {((inputs?: Player_Settings_LibraryInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Settings_LibraryInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_settings_library(inputs)
	return en_player_settings_library(inputs)
});