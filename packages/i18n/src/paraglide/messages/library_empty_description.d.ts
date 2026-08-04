/**
* | output |
* | --- |
* | "A source can be an R2 public domain, an nginx directory, or any HTTPS URL containing catalog.json." |
*
* @param {Library_Empty_DescriptionInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const library_empty_description: ((inputs?: Library_Empty_DescriptionInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Empty_DescriptionInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Empty_DescriptionInputs = {};
