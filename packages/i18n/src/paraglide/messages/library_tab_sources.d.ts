/**
* | output |
* | --- |
* | "Sources" |
*
* @param {Library_Tab_SourcesInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const library_tab_sources: ((inputs?: Library_Tab_SourcesInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Tab_SourcesInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Tab_SourcesInputs = {};
