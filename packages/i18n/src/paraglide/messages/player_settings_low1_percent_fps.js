/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ value: NonNullable<unknown> }} Player_Settings_Low1_Percent_FpsInputs */

const en_player_settings_low1_percent_fps = /** @type {(inputs: Player_Settings_Low1_Percent_FpsInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`1% low ${i?.value}`)
};

const zh_player_settings_low1_percent_fps = /** @type {(inputs: Player_Settings_Low1_Percent_FpsInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`1% 低帧 ${i?.value}`)
};

/**
* | output |
* | --- |
* | "1% low {value}" |
*
* @param {Player_Settings_Low1_Percent_FpsInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_low1_percent_fps = /** @type {((inputs: Player_Settings_Low1_Percent_FpsInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Settings_Low1_Percent_FpsInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_settings_low1_percent_fps(inputs)
	return en_player_settings_low1_percent_fps(inputs)
});