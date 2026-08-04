/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Settings_Playback_SpeedInputs */

const en_player_settings_playback_speed = /** @type {(inputs: Player_Settings_Playback_SpeedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Playback speed`)
};

const zh_player_settings_playback_speed = /** @type {(inputs: Player_Settings_Playback_SpeedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`播放速度`)
};

/**
* | output |
* | --- |
* | "Playback speed" |
*
* @param {Player_Settings_Playback_SpeedInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_playback_speed = /** @type {((inputs?: Player_Settings_Playback_SpeedInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Settings_Playback_SpeedInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_settings_playback_speed(inputs)
	return en_player_settings_playback_speed(inputs)
});