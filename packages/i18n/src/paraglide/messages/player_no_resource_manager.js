/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_No_Resource_ManagerInputs */

const en_player_no_resource_manager = /** @type {(inputs: Player_No_Resource_ManagerInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No resource manager is available.`)
};

const zh_player_no_resource_manager = /** @type {(inputs: Player_No_Resource_ManagerInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`没有可用的资源管理器。`)
};

/**
* | output |
* | --- |
* | "No resource manager is available." |
*
* @param {Player_No_Resource_ManagerInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_no_resource_manager = /** @type {((inputs?: Player_No_Resource_ManagerInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_No_Resource_ManagerInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_no_resource_manager(inputs)
	return en_player_no_resource_manager(inputs)
});