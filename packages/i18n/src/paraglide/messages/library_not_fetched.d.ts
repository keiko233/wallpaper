/**
* | output |
* | --- |
* | "Not fetched" |
*
* @param {Library_Not_FetchedInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const library_not_fetched: ((inputs?: Library_Not_FetchedInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Not_FetchedInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Not_FetchedInputs = {};
