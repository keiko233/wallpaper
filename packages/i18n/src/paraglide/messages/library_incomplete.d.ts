/**
* | output |
* | --- |
* | "Incomplete" |
*
* @param {Library_IncompleteInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const library_incomplete: ((inputs?: Library_IncompleteInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_IncompleteInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_IncompleteInputs = {};
