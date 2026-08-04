/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Settings_Physics_HavokInputs */

const en_player_settings_physics_havok = /** @type {(inputs: Player_Settings_Physics_HavokInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Havok (lighter)`)
};

const zh_player_settings_physics_havok = /** @type {(inputs: Player_Settings_Physics_HavokInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Havok（更轻量）`)
};

/**
* | output |
* | --- |
* | "Havok (lighter)" |
*
* @param {Player_Settings_Physics_HavokInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_physics_havok = /** @type {((inputs?: Player_Settings_Physics_HavokInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Settings_Physics_HavokInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_settings_physics_havok(inputs)
	return en_player_settings_physics_havok(inputs)
});