/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Overlay_Gpu_UnknownInputs */

const en_player_overlay_gpu_unknown = /** @type {(inputs: Player_Overlay_Gpu_UnknownInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Unknown GPU`)
};

const zh_player_overlay_gpu_unknown = /** @type {(inputs: Player_Overlay_Gpu_UnknownInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`未知 GPU`)
};

/**
* | output |
* | --- |
* | "Unknown GPU" |
*
* @param {Player_Overlay_Gpu_UnknownInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_overlay_gpu_unknown = /** @type {((inputs?: Player_Overlay_Gpu_UnknownInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Overlay_Gpu_UnknownInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_overlay_gpu_unknown(inputs)
	return en_player_overlay_gpu_unknown(inputs)
});