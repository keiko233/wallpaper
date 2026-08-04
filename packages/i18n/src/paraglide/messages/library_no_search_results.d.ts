/**
* | output |
* | --- |
* | "No resources from enabled sources match this search." |
*
* @param {Library_No_Search_ResultsInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const library_no_search_results: ((inputs?: Library_No_Search_ResultsInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_No_Search_ResultsInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_No_Search_ResultsInputs = {};
