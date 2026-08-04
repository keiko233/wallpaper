/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Settings_Background_ColorInputs */

const en_player_settings_background_color = /** @type {(inputs: Player_Settings_Background_ColorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Background color`)
};

const zh_player_settings_background_color = /** @type {(inputs: Player_Settings_Background_ColorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`背景颜色`)
};

/**
* | output |
* | --- |
* | "Background color" |
*
* @param {Player_Settings_Background_ColorInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_background_color = /** @type {((inputs?: Player_Settings_Background_ColorInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Settings_Background_ColorInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_settings_background_color(inputs)
	return en_player_settings_background_color(inputs)
});