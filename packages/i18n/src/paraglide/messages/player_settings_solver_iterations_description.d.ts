/**
* | output |
* | --- |
* | "More iterations resolve clipping between hair, clothes and skin more reliably." |
*
* @param {Player_Settings_Solver_Iterations_DescriptionInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_solver_iterations_description: ((inputs?: Player_Settings_Solver_Iterations_DescriptionInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Player_Settings_Solver_Iterations_DescriptionInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Player_Settings_Solver_Iterations_DescriptionInputs = {};
