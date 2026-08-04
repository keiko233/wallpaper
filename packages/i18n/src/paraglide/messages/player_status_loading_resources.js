/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Status_Loading_ResourcesInputs */

const en_player_status_loading_resources = /** @type {(inputs: Player_Status_Loading_ResourcesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Loading resources`)
};

const zh_player_status_loading_resources = /** @type {(inputs: Player_Status_Loading_ResourcesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`正在加载资源`)
};

/**
* | output |
* | --- |
* | "Loading resources" |
*
* @param {Player_Status_Loading_ResourcesInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_status_loading_resources = /** @type {((inputs?: Player_Status_Loading_ResourcesInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Status_Loading_ResourcesInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_status_loading_resources(inputs)
	return en_player_status_loading_resources(inputs)
});