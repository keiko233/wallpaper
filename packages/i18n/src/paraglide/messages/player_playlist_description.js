/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Playlist_DescriptionInputs */

const en_player_playlist_description = /** @type {(inputs: Player_Playlist_DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Combine any model, motion, stage, and skybox. Audio and camera follow the selected motion. The list loops continuously and is saved automatically on this device.`)
};

const zh_player_playlist_description = /** @type {(inputs: Player_Playlist_DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`可组合任意模型、动作、舞台和天空盒。音频和镜头跟随所选动作。列表循环播放，并自动保存在本机上。`)
};

/**
* | output |
* | --- |
* | "Combine any model, motion, stage, and skybox. Audio and camera follow the selected motion. The list loops continuously and is saved automatically on this dev..." |
*
* @param {Player_Playlist_DescriptionInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_playlist_description = /** @type {((inputs?: Player_Playlist_DescriptionInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Playlist_DescriptionInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_playlist_description(inputs)
	return en_player_playlist_description(inputs)
});