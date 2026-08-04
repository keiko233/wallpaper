/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Settings_Live_StatsInputs */

const en_player_settings_live_stats = /** @type {(inputs: Player_Settings_Live_StatsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Live stats`)
};

const zh_player_settings_live_stats = /** @type {(inputs: Player_Settings_Live_StatsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`实时统计`)
};

/**
* | output |
* | --- |
* | "Live stats" |
*
* @param {Player_Settings_Live_StatsInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_live_stats = /** @type {((inputs?: Player_Settings_Live_StatsInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Settings_Live_StatsInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_settings_live_stats(inputs)
	return en_player_settings_live_stats(inputs)
});