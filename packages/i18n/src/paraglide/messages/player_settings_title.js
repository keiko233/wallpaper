/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Settings_TitleInputs */

const en_player_settings_title = /** @type {(inputs: Player_Settings_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Player settings`)
};

const zh_player_settings_title = /** @type {(inputs: Player_Settings_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`播放器设置`)
};

/**
* | output |
* | --- |
* | "Player settings" |
*
* @param {Player_Settings_TitleInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_title = /** @type {((inputs?: Player_Settings_TitleInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Settings_TitleInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_settings_title(inputs)
	return en_player_settings_title(inputs)
});