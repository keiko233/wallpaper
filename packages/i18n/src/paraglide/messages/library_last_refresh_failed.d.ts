/**
* | output |
* | --- |
* | "Last refresh failed" |
*
* @param {Library_Last_Refresh_FailedInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const library_last_refresh_failed: ((inputs?: Library_Last_Refresh_FailedInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Last_Refresh_FailedInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Last_Refresh_FailedInputs = {};
