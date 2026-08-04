/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Settings_Ready_Preparing_NextInputs */

const en_player_settings_ready_preparing_next = /** @type {(inputs: Player_Settings_Ready_Preparing_NextInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ready · preparing next item`)
};

const zh_player_settings_ready_preparing_next = /** @type {(inputs: Player_Settings_Ready_Preparing_NextInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`就绪 · 正在准备下一项`)
};

/**
* | output |
* | --- |
* | "Ready · preparing next item" |
*
* @param {Player_Settings_Ready_Preparing_NextInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_ready_preparing_next = /** @type {((inputs?: Player_Settings_Ready_Preparing_NextInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Settings_Ready_Preparing_NextInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_settings_ready_preparing_next(inputs)
	return en_player_settings_ready_preparing_next(inputs)
});