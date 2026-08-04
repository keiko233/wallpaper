/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Settings_Focus_DistanceInputs */

const en_player_settings_focus_distance = /** @type {(inputs: Player_Settings_Focus_DistanceInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Focus distance`)
};

const zh_player_settings_focus_distance = /** @type {(inputs: Player_Settings_Focus_DistanceInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`对焦距离`)
};

/**
* | output |
* | --- |
* | "Focus distance" |
*
* @param {Player_Settings_Focus_DistanceInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_focus_distance = /** @type {((inputs?: Player_Settings_Focus_DistanceInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Settings_Focus_DistanceInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_settings_focus_distance(inputs)
	return en_player_settings_focus_distance(inputs)
});