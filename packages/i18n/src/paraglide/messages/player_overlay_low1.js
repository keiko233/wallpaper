/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Overlay_Low1Inputs */

const en_player_overlay_low1 = /** @type {(inputs: Player_Overlay_Low1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`1% LOW`)
};

const zh_player_overlay_low1 = /** @type {(inputs: Player_Overlay_Low1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`1% 低帧`)
};

/**
* | output |
* | --- |
* | "1% LOW" |
*
* @param {Player_Overlay_Low1Inputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_overlay_low1 = /** @type {((inputs?: Player_Overlay_Low1Inputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Overlay_Low1Inputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_overlay_low1(inputs)
	return en_player_overlay_low1(inputs)
});