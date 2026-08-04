/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Overlay_Frame_HistoryInputs */

const en_player_overlay_frame_history = /** @type {(inputs: Player_Overlay_Frame_HistoryInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Frame history`)
};

const zh_player_overlay_frame_history = /** @type {(inputs: Player_Overlay_Frame_HistoryInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`帧历史`)
};

/**
* | output |
* | --- |
* | "Frame history" |
*
* @param {Player_Overlay_Frame_HistoryInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_overlay_frame_history = /** @type {((inputs?: Player_Overlay_Frame_HistoryInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Overlay_Frame_HistoryInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_overlay_frame_history(inputs)
	return en_player_overlay_frame_history(inputs)
});