/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Setup_DescriptionInputs */

const en_player_setup_description = /** @type {(inputs: Player_Setup_DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Add resources before configuring playback and visuals.`)
};

const zh_player_setup_description = /** @type {(inputs: Player_Setup_DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`在配置播放和画面之前，请先添加资源。`)
};

/**
* | output |
* | --- |
* | "Add resources before configuring playback and visuals." |
*
* @param {Player_Setup_DescriptionInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_setup_description = /** @type {((inputs?: Player_Setup_DescriptionInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Setup_DescriptionInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_setup_description(inputs)
	return en_player_setup_description(inputs)
});