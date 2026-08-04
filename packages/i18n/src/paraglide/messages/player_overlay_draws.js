/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown> }} Player_Overlay_DrawsInputs */

const en_player_overlay_draws = /** @type {(inputs: Player_Overlay_DrawsInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} draws`)
};

const zh_player_overlay_draws = /** @type {(inputs: Player_Overlay_DrawsInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} 次绘制`)
};

/**
* | output |
* | --- |
* | "{count} draws" |
*
* @param {Player_Overlay_DrawsInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_overlay_draws = /** @type {((inputs: Player_Overlay_DrawsInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Overlay_DrawsInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_overlay_draws(inputs)
	return en_player_overlay_draws(inputs)
});