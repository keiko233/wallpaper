/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Web_Empty_Playlist_DescriptionInputs */

const en_web_empty_playlist_description = /** @type {(inputs: Web_Empty_Playlist_DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Open player setup below, then add at least one model, motion, and stage. Everything you add is cached only on this device.`)
};

const zh_web_empty_playlist_description = /** @type {(inputs: Web_Empty_Playlist_DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`打开下方的播放器设置，然后至少添加一个模型、动作和舞台。您添加的所有内容仅缓存在本机。`)
};

/**
* | output |
* | --- |
* | "Open player setup below, then add at least one model, motion, and stage. Everything you add is cached only on this device." |
*
* @param {Web_Empty_Playlist_DescriptionInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const web_empty_playlist_description = /** @type {((inputs?: Web_Empty_Playlist_DescriptionInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Web_Empty_Playlist_DescriptionInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_web_empty_playlist_description(inputs)
	return en_web_empty_playlist_description(inputs)
});