/**
* | output |
* | --- |
* | "Root URLs, subpaths, and direct catalog.json URLs are supported. The host must allow browser CORS." |
*
* @param {Library_Source_Url_DescriptionInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const library_source_url_description: ((inputs?: Library_Source_Url_DescriptionInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Source_Url_DescriptionInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Source_Url_DescriptionInputs = {};
