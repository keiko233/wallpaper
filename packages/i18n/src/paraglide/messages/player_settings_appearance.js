/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Settings_AppearanceInputs */

const en_player_settings_appearance = /** @type {(inputs: Player_Settings_AppearanceInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Appearance`)
};

const zh_player_settings_appearance = /** @type {(inputs: Player_Settings_AppearanceInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`外观`)
};

/**
* | output |
* | --- |
* | "Appearance" |
*
* @param {Player_Settings_AppearanceInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_appearance = /** @type {((inputs?: Player_Settings_AppearanceInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Settings_AppearanceInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_settings_appearance(inputs)
	return en_player_settings_appearance(inputs)
});