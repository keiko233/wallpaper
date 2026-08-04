/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Settings_Physics_Engine_DescriptionInputs */

const en_player_settings_physics_engine_description = /** @type {(inputs: Player_Settings_Physics_Engine_DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Bullet matches how MMD itself simulates skirts and hair, and honors the model's joint springs. Havok loads faster but drops those settings. Changing the engine reloads the current resources.`)
};

const zh_player_settings_physics_engine_description = /** @type {(inputs: Player_Settings_Physics_Engine_DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Bullet 与 MMD 自身的裙摆和头发模拟方式一致，并遵循模型的关节弹簧。Havok 加载更快，但会忽略这些设置。更换引擎会重新加载当前资源。`)
};

/**
* | output |
* | --- |
* | "Bullet matches how MMD itself simulates skirts and hair, and honors the model's joint springs. Havok loads faster but drops those settings. Changing the engi..." |
*
* @param {Player_Settings_Physics_Engine_DescriptionInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_physics_engine_description = /** @type {((inputs?: Player_Settings_Physics_Engine_DescriptionInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Settings_Physics_Engine_DescriptionInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_settings_physics_engine_description(inputs)
	return en_player_settings_physics_engine_description(inputs)
});