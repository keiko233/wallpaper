/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Settings_MotionInputs */

const en_player_settings_motion = /** @type {(inputs: Player_Settings_MotionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Motion`)
};

const zh_player_settings_motion = /** @type {(inputs: Player_Settings_MotionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`动作`)
};

/**
* | output |
* | --- |
* | "Motion" |
*
* @param {Player_Settings_MotionInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_motion = /** @type {((inputs?: Player_Settings_MotionInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Settings_MotionInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_settings_motion(inputs)
	return en_player_settings_motion(inputs)
});