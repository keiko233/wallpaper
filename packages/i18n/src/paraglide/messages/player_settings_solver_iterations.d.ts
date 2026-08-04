/**
* | output |
* | --- |
* | "Solver iterations" |
*
* @param {Player_Settings_Solver_IterationsInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_settings_solver_iterations: ((inputs?: Player_Settings_Solver_IterationsInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Player_Settings_Solver_IterationsInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Player_Settings_Solver_IterationsInputs = {};
