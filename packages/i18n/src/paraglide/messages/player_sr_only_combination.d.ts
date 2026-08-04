/**
* | output |
* | --- |
* | "Model: {model}. Stage: {stage}. Skybox: {skybox}." |
*
* @param {Player_Sr_Only_CombinationInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_sr_only_combination: ((inputs: Player_Sr_Only_CombinationInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Player_Sr_Only_CombinationInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Player_Sr_Only_CombinationInputs = {
    model: NonNullable<unknown>;
    stage: NonNullable<unknown>;
    skybox: NonNullable<unknown>;
};
