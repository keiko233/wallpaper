/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Reload_Current_ItemInputs */

const en_player_reload_current_item = /** @type {(inputs: Player_Reload_Current_ItemInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Reload current item`)
};

const zh_player_reload_current_item = /** @type {(inputs: Player_Reload_Current_ItemInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`重新加载当前项`)
};

/**
* | output |
* | --- |
* | "Reload current item" |
*
* @param {Player_Reload_Current_ItemInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_reload_current_item = /** @type {((inputs?: Player_Reload_Current_ItemInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Reload_Current_ItemInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_reload_current_item(inputs)
	return en_player_reload_current_item(inputs)
});