/**
* | output |
* | --- |
* | "Search models, motions, stages, skyboxes…" |
*
* @param {Library_Search_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const library_search_placeholder: ((inputs?: Library_Search_PlaceholderInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Search_PlaceholderInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Search_PlaceholderInputs = {};
