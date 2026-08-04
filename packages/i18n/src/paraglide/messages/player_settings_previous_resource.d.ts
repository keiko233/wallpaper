/**
* | output |
* | --- |
* | "Previous {label}" |
*
* @param {Player_Settings_Previous_ResourceInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_previous_resource: ((inputs: Player_Settings_Previous_ResourceInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Player_Settings_Previous_ResourceInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Player_Settings_Previous_ResourceInputs = {
    label: NonNullable<unknown>;
};
