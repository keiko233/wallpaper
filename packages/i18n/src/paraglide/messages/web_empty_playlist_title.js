/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Web_Empty_Playlist_TitleInputs */

const en_web_empty_playlist_title = /** @type {(inputs: Web_Empty_Playlist_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Your playlist is empty`)
};

const zh_web_empty_playlist_title = /** @type {(inputs: Web_Empty_Playlist_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`您的播放列表为空`)
};

/**
* | output |
* | --- |
* | "Your playlist is empty" |
*
* @param {Web_Empty_Playlist_TitleInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const web_empty_playlist_title = /** @type {((inputs?: Web_Empty_Playlist_TitleInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Web_Empty_Playlist_TitleInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_web_empty_playlist_title(inputs)
	return en_web_empty_playlist_title(inputs)
});