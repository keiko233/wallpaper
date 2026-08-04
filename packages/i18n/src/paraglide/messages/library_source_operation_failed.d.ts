/**
* | output |
* | --- |
* | "Source operation failed" |
*
* @param {Library_Source_Operation_FailedInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const library_source_operation_failed: ((inputs?: Library_Source_Operation_FailedInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Source_Operation_FailedInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Source_Operation_FailedInputs = {};
