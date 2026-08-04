/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Overlay_Drag_LabelInputs */

const en_player_overlay_drag_label = /** @type {(inputs: Player_Overlay_Drag_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Drag performance overlay`)
};

const zh_player_overlay_drag_label = /** @type {(inputs: Player_Overlay_Drag_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`拖动性能悬浮窗`)
};

/**
* | output |
* | --- |
* | "Drag performance overlay" |
*
* @param {Player_Overlay_Drag_LabelInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_overlay_drag_label = /** @type {((inputs?: Player_Overlay_Drag_LabelInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Overlay_Drag_LabelInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_overlay_drag_label(inputs)
	return en_player_overlay_drag_label(inputs)
});