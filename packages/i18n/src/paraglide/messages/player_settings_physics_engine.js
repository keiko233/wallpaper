/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Settings_Physics_EngineInputs */

const en_player_settings_physics_engine = /** @type {(inputs: Player_Settings_Physics_EngineInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Physics engine`)
};

const zh_player_settings_physics_engine = /** @type {(inputs: Player_Settings_Physics_EngineInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`物理引擎`)
};

/**
* | output |
* | --- |
* | "Physics engine" |
*
* @param {Player_Settings_Physics_EngineInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_physics_engine = /** @type {((inputs?: Player_Settings_Physics_EngineInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Settings_Physics_EngineInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_settings_physics_engine(inputs)
	return en_player_settings_physics_engine(inputs)
});