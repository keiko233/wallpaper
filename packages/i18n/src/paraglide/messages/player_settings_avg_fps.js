/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ value: NonNullable<unknown> }} Player_Settings_Avg_FpsInputs */

const en_player_settings_avg_fps = /** @type {(inputs: Player_Settings_Avg_FpsInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`avg ${i?.value}`)
};

const zh_player_settings_avg_fps = /** @type {(inputs: Player_Settings_Avg_FpsInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`平均 ${i?.value}`)
};

/**
* | output |
* | --- |
* | "avg {value}" |
*
* @param {Player_Settings_Avg_FpsInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_avg_fps = /** @type {((inputs: Player_Settings_Avg_FpsInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Settings_Avg_FpsInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_settings_avg_fps(inputs)
	return en_player_settings_avg_fps(inputs)
});