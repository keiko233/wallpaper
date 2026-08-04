/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Overlay_Region_LabelInputs */

const en_player_overlay_region_label = /** @type {(inputs: Player_Overlay_Region_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Live rendering performance`)
};

const zh_player_overlay_region_label = /** @type {(inputs: Player_Overlay_Region_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`实时渲染性能`)
};

/**
* | output |
* | --- |
* | "Live rendering performance" |
*
* @param {Player_Overlay_Region_LabelInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_overlay_region_label = /** @type {((inputs?: Player_Overlay_Region_LabelInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Overlay_Region_LabelInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_overlay_region_label(inputs)
	return en_player_overlay_region_label(inputs)
});