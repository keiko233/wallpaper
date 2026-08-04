/**
* | output |
* | --- |
* | "Preparing catalog resource" |
*
* @param {Library_Progress_CatalogInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const library_progress_catalog: ((inputs?: Library_Progress_CatalogInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Progress_CatalogInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Progress_CatalogInputs = {};
