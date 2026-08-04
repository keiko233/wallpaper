/**
* | output |
* | --- |
* | "No resource sources configured." |
*
* @param {Library_No_Sources_ConfiguredInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const library_no_sources_configured: ((inputs?: Library_No_Sources_ConfiguredInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_No_Sources_ConfiguredInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_No_Sources_ConfiguredInputs = {};
