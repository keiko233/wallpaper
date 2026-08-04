/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Overlay_Low01Inputs */

const en_player_overlay_low01 = /** @type {(inputs: Player_Overlay_Low01Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`0.1%`)
};

const zh_player_overlay_low01 = /** @type {(inputs: Player_Overlay_Low01Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`0.1%`)
};

/**
* | output |
* | --- |
* | "0.1%" |
*
* @param {Player_Overlay_Low01Inputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_overlay_low01 = /** @type {((inputs?: Player_Overlay_Low01Inputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Overlay_Low01Inputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_overlay_low01(inputs)
	return en_player_overlay_low01(inputs)
});