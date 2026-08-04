/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Player_Settings_Joint_Limit_DescriptionInputs */

const en_player_settings_joint_limit_description = /** @type {(inputs: Player_Settings_Joint_Limit_DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Lower joint limits keep the model's original hair and skirt motion; higher values improve stability on broken joints. Changing SSAO, SSR, physics or this value reloads the current resources.`)
};

const zh_player_settings_joint_limit_description = /** @type {(inputs: Player_Settings_Joint_Limit_DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`较低的关节限制会保留模型原有的头发和裙摆动作；较高的数值可改善损坏关节的稳定性。更改 SSAO、SSR、物理或此值都会重新加载当前资源。`)
};

/**
* | output |
* | --- |
* | "Lower joint limits keep the model's original hair and skirt motion; higher values improve stability on broken joints. Changing SSAO, SSR, physics or this val..." |
*
* @param {Player_Settings_Joint_Limit_DescriptionInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_joint_limit_description = /** @type {((inputs?: Player_Settings_Joint_Limit_DescriptionInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Player_Settings_Joint_Limit_DescriptionInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_player_settings_joint_limit_description(inputs)
	return en_player_settings_joint_limit_description(inputs)
});