/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Overlay_Drag_TitleInputs */

const en_player_overlay_drag_title = /** @type {(inputs: Player_Overlay_Drag_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Drag to reposition`)
};

const zh_player_overlay_drag_title = /** @type {(inputs: Player_Overlay_Drag_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`拖动以调整位置`)
};

/**
* | output |
* | --- |
* | "Drag to reposition" |
*
* @param {Player_Overlay_Drag_TitleInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_overlay_drag_title = /** @type {((inputs?: Player_Overlay_Drag_TitleInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Overlay_Drag_TitleInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_overlay_drag_title(inputs)
	return en_player_overlay_drag_title(inputs)
});