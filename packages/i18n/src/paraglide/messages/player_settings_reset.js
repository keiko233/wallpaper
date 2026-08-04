/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Settings_ResetInputs */

const en_player_settings_reset = /** @type {(inputs: Player_Settings_ResetInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Reset`)
};

const zh_player_settings_reset = /** @type {(inputs: Player_Settings_ResetInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`重置`)
};

/**
* | output |
* | --- |
* | "Reset" |
*
* @param {Player_Settings_ResetInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_reset = /** @type {((inputs?: Player_Settings_ResetInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Settings_ResetInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_settings_reset(inputs)
	return en_player_settings_reset(inputs)
});