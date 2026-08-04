/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ label: NonNullable<unknown> }} Player_Settings_Next_ResourceInputs */

const en_player_settings_next_resource = /** @type {(inputs: Player_Settings_Next_ResourceInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Next ${i?.label}`)
};

const zh_player_settings_next_resource = /** @type {(inputs: Player_Settings_Next_ResourceInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`下一个${i?.label}`)
};

/**
* | output |
* | --- |
* | "Next {label}" |
*
* @param {Player_Settings_Next_ResourceInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_next_resource = /** @type {((inputs: Player_Settings_Next_ResourceInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Settings_Next_ResourceInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_settings_next_resource(inputs)
	return en_player_settings_next_resource(inputs)
});