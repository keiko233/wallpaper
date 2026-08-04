/**
* | output |
* | --- |
* | "Local library could not be loaded" |
*
* @param {Web_Local_Library_Load_FailedInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const web_local_library_load_failed: ((inputs?: Web_Local_Library_Load_FailedInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Web_Local_Library_Load_FailedInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Web_Local_Library_Load_FailedInputs = {};
