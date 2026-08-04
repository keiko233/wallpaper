/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Settings_ExposureInputs */

const en_player_settings_exposure = /** @type {(inputs: Player_Settings_ExposureInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Exposure`)
};

const zh_player_settings_exposure = /** @type {(inputs: Player_Settings_ExposureInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`曝光`)
};

/**
* | output |
* | --- |
* | "Exposure" |
*
* @param {Player_Settings_ExposureInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_exposure = /** @type {((inputs?: Player_Settings_ExposureInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Settings_ExposureInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_settings_exposure(inputs)
	return en_player_settings_exposure(inputs)
});