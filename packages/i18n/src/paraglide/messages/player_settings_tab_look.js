/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Settings_Tab_LookInputs */

const en_player_settings_tab_look = /** @type {(inputs: Player_Settings_Tab_LookInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Look`)
};

const zh_player_settings_tab_look = /** @type {(inputs: Player_Settings_Tab_LookInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`外观`)
};

/**
* | output |
* | --- |
* | "Look" |
*
* @param {Player_Settings_Tab_LookInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_tab_look = /** @type {((inputs?: Player_Settings_Tab_LookInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Settings_Tab_LookInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_settings_tab_look(inputs)
	return en_player_settings_tab_look(inputs)
});