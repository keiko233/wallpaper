/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Settings_FpsInputs */

const en_player_settings_fps = /** @type {(inputs: Player_Settings_FpsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`FPS`)
};

const zh_player_settings_fps = /** @type {(inputs: Player_Settings_FpsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`FPS`)
};

/**
* | output |
* | --- |
* | "FPS" |
*
* @param {Player_Settings_FpsInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_fps = /** @type {((inputs?: Player_Settings_FpsInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Settings_FpsInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_settings_fps(inputs)
	return en_player_settings_fps(inputs)
});