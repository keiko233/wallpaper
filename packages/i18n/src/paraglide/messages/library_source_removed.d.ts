/**
* | output |
* | --- |
* | "Source removed" |
*
* @param {Library_Source_RemovedInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const library_source_removed: ((inputs?: Library_Source_RemovedInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Source_RemovedInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Source_RemovedInputs = {};
