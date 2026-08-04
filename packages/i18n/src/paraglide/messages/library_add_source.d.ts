/**
* | output |
* | --- |
* | "Add source" |
*
* @param {Library_Add_SourceInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const library_add_source: ((inputs?: Library_Add_SourceInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Add_SourceInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Add_SourceInputs = {};
