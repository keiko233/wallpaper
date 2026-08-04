/**
* | output |
* | --- |
* | "{kind} placeholder cover" |
*
* @param {Library_Placeholder_CoverInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const library_placeholder_cover: ((inputs: Library_Placeholder_CoverInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Placeholder_CoverInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Placeholder_CoverInputs = {
    kind: NonNullable<unknown>;
};
