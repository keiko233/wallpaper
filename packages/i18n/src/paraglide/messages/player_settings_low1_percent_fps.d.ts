/**
* | output |
* | --- |
* | "1% low {value}" |
*
* @param {Player_Settings_Low1_Percent_FpsInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_low1_percent_fps: ((inputs: Player_Settings_Low1_Percent_FpsInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Player_Settings_Low1_Percent_FpsInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Player_Settings_Low1_Percent_FpsInputs = {
    value: NonNullable<unknown>;
};
