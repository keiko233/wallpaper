/**
* | output |
* | --- |
* | "{level}× anisotropic" |
*
* @param {Player_Settings_AnisotropicInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_anisotropic: ((inputs: Player_Settings_AnisotropicInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Player_Settings_AnisotropicInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Player_Settings_AnisotropicInputs = {
    level: NonNullable<unknown>;
};
