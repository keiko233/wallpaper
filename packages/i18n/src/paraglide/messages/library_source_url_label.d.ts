/**
* | output |
* | --- |
* | "Resource source URL" |
*
* @param {Library_Source_Url_LabelInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const library_source_url_label: ((inputs?: Library_Source_Url_LabelInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Source_Url_LabelInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Source_Url_LabelInputs = {};
