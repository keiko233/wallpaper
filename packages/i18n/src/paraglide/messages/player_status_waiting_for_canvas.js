/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Status_Waiting_For_CanvasInputs */

const en_player_status_waiting_for_canvas = /** @type {(inputs: Player_Status_Waiting_For_CanvasInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Waiting for canvas`)
};

const zh_player_status_waiting_for_canvas = /** @type {(inputs: Player_Status_Waiting_For_CanvasInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`等待画布`)
};

/**
* | output |
* | --- |
* | "Waiting for canvas" |
*
* @param {Player_Status_Waiting_For_CanvasInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_status_waiting_for_canvas = /** @type {((inputs?: Player_Status_Waiting_For_CanvasInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Status_Waiting_For_CanvasInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_status_waiting_for_canvas(inputs)
	return en_player_status_waiting_for_canvas(inputs)
});