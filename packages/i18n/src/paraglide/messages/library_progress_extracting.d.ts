/**
* | output |
* | --- |
* | "Preparing local files" |
*
* @param {Library_Progress_ExtractingInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const library_progress_extracting: ((inputs?: Library_Progress_ExtractingInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Progress_ExtractingInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Progress_ExtractingInputs = {};
