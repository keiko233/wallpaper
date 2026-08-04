/**
* | output |
* | --- |
* | "Skyboxes" |
*
* @param {Library_Kind_SkyboxInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const library_kind_skybox: ((inputs?: Library_Kind_SkyboxInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Kind_SkyboxInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Kind_SkyboxInputs = {};
