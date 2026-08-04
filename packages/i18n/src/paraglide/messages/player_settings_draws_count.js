/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown> }} Player_Settings_Draws_CountInputs */

const en_player_settings_draws_count = /** @type {(inputs: Player_Settings_Draws_CountInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} draws`)
};

const zh_player_settings_draws_count = /** @type {(inputs: Player_Settings_Draws_CountInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} 次绘制`)
};

/**
* | output |
* | --- |
* | "{count} draws" |
*
* @param {Player_Settings_Draws_CountInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_draws_count = /** @type {((inputs: Player_Settings_Draws_CountInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Settings_Draws_CountInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_settings_draws_count(inputs)
	return en_player_settings_draws_count(inputs)
});