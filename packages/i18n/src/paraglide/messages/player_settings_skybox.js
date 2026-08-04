/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Settings_SkyboxInputs */

const en_player_settings_skybox = /** @type {(inputs: Player_Settings_SkyboxInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Skybox`)
};

const zh_player_settings_skybox = /** @type {(inputs: Player_Settings_SkyboxInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`天空盒`)
};

/**
* | output |
* | --- |
* | "Skybox" |
*
* @param {Player_Settings_SkyboxInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_skybox = /** @type {((inputs?: Player_Settings_SkyboxInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Settings_SkyboxInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_settings_skybox(inputs)
	return en_player_settings_skybox(inputs)
});