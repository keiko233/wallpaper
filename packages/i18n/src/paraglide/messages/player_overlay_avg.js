/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Overlay_AvgInputs */

const en_player_overlay_avg = /** @type {(inputs: Player_Overlay_AvgInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`AVG`)
};

const zh_player_overlay_avg = /** @type {(inputs: Player_Overlay_AvgInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`平均`)
};

/**
* | output |
* | --- |
* | "AVG" |
*
* @param {Player_Overlay_AvgInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_overlay_avg = /** @type {((inputs?: Player_Overlay_AvgInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Overlay_AvgInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_overlay_avg(inputs)
	return en_player_overlay_avg(inputs)
});