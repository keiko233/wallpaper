/**
* | output |
* | --- |
* | "Add a model, motion, stage, and skybox option to begin." |
*
* @param {Player_Add_Resources_PromptInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_add_resources_prompt: ((inputs?: Player_Add_Resources_PromptInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Player_Add_Resources_PromptInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Player_Add_Resources_PromptInputs = {};
