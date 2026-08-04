/**
* | output |
* | --- |
* | "Choose whether resources already installed from this source should remain available on this device. Both options remove the source and its cached catalog." |
*
* @param {Library_Remove_Source_DescriptionInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const library_remove_source_description: ((inputs?: Library_Remove_Source_DescriptionInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Remove_Source_DescriptionInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Remove_Source_DescriptionInputs = {};
