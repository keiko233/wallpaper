/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Settings_Tab_ContentInputs */

const en_player_settings_tab_content = /** @type {(inputs: Player_Settings_Tab_ContentInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Content`)
};

const zh_player_settings_tab_content = /** @type {(inputs: Player_Settings_Tab_ContentInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`内容`)
};

/**
* | output |
* | --- |
* | "Content" |
*
* @param {Player_Settings_Tab_ContentInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_tab_content = /** @type {((inputs?: Player_Settings_Tab_ContentInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Settings_Tab_ContentInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_settings_tab_content(inputs)
	return en_player_settings_tab_content(inputs)
});