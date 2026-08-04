/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Settings_Waiting_For_FramesInputs */

const en_player_settings_waiting_for_frames = /** @type {(inputs: Player_Settings_Waiting_For_FramesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Waiting for the first rendered frames…`)
};

const zh_player_settings_waiting_for_frames = /** @type {(inputs: Player_Settings_Waiting_For_FramesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`等待首批渲染帧……`)
};

/**
* | output |
* | --- |
* | "Waiting for the first rendered frames…" |
*
* @param {Player_Settings_Waiting_For_FramesInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_waiting_for_frames = /** @type {((inputs?: Player_Settings_Waiting_For_FramesInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Settings_Waiting_For_FramesInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_settings_waiting_for_frames(inputs)
	return en_player_settings_waiting_for_frames(inputs)
});