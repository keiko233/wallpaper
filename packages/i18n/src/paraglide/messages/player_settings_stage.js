/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Settings_StageInputs */

const en_player_settings_stage = /** @type {(inputs: Player_Settings_StageInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Stage`)
};

const zh_player_settings_stage = /** @type {(inputs: Player_Settings_StageInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`舞台`)
};

/**
* | output |
* | --- |
* | "Stage" |
*
* @param {Player_Settings_StageInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_stage = /** @type {((inputs?: Player_Settings_StageInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Settings_StageInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_settings_stage(inputs)
	return en_player_settings_stage(inputs)
});