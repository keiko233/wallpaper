/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Settings_Stage_DefaultInputs */

const en_player_settings_stage_default = /** @type {(inputs: Player_Settings_Stage_DefaultInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Stage default`)
};

const zh_player_settings_stage_default = /** @type {(inputs: Player_Settings_Stage_DefaultInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`舞台默认`)
};

/**
* | output |
* | --- |
* | "Stage default" |
*
* @param {Player_Settings_Stage_DefaultInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_stage_default = /** @type {((inputs?: Player_Settings_Stage_DefaultInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Settings_Stage_DefaultInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_settings_stage_default(inputs)
	return en_player_settings_stage_default(inputs)
});