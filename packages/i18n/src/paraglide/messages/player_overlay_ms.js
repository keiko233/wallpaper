/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Overlay_MsInputs */

const en_player_overlay_ms = /** @type {(inputs: Player_Overlay_MsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`ms`)
};

const zh_player_overlay_ms = /** @type {(inputs: Player_Overlay_MsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`ms`)
};

/**
* | output |
* | --- |
* | "ms" |
*
* @param {Player_Overlay_MsInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_overlay_ms = /** @type {((inputs?: Player_Overlay_MsInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Overlay_MsInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_overlay_ms(inputs)
	return en_player_overlay_ms(inputs)
});