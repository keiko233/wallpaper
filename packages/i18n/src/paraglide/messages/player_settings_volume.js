/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Settings_VolumeInputs */

const en_player_settings_volume = /** @type {(inputs: Player_Settings_VolumeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Volume`)
};

const zh_player_settings_volume = /** @type {(inputs: Player_Settings_VolumeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`音量`)
};

/**
* | output |
* | --- |
* | "Volume" |
*
* @param {Player_Settings_VolumeInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_volume = /** @type {((inputs?: Player_Settings_VolumeInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Settings_VolumeInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_settings_volume(inputs)
	return en_player_settings_volume(inputs)
});