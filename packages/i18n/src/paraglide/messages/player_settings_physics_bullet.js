/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Settings_Physics_BulletInputs */

const en_player_settings_physics_bullet = /** @type {(inputs: Player_Settings_Physics_BulletInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Bullet (MMD accurate)`)
};

const zh_player_settings_physics_bullet = /** @type {(inputs: Player_Settings_Physics_BulletInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Bullet（MMD 精确）`)
};

/**
* | output |
* | --- |
* | "Bullet (MMD accurate)" |
*
* @param {Player_Settings_Physics_BulletInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_physics_bullet = /** @type {((inputs?: Player_Settings_Physics_BulletInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Settings_Physics_BulletInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_settings_physics_bullet(inputs)
	return en_player_settings_physics_bullet(inputs)
});