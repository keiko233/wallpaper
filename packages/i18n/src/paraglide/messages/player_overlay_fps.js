/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Overlay_FpsInputs */

const en_player_overlay_fps = /** @type {(inputs: Player_Overlay_FpsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`FPS`)
};

const zh_player_overlay_fps = /** @type {(inputs: Player_Overlay_FpsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`FPS`)
};

/**
* | output |
* | --- |
* | "FPS" |
*
* @param {Player_Overlay_FpsInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_overlay_fps = /** @type {((inputs?: Player_Overlay_FpsInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Overlay_FpsInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_overlay_fps(inputs)
	return en_player_overlay_fps(inputs)
});