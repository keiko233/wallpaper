/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown> }} Player_Overlay_MeshesInputs */

const en_player_overlay_meshes = /** @type {(inputs: Player_Overlay_MeshesInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} meshes`)
};

const zh_player_overlay_meshes = /** @type {(inputs: Player_Overlay_MeshesInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} 个网格`)
};

/**
* | output |
* | --- |
* | "{count} meshes" |
*
* @param {Player_Overlay_MeshesInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_overlay_meshes = /** @type {((inputs: Player_Overlay_MeshesInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Overlay_MeshesInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_overlay_meshes(inputs)
	return en_player_overlay_meshes(inputs)
});