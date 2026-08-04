/**
* | output |
* | --- |
* | "Last successful refresh" |
*
* @param {Library_Last_Successful_RefreshInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const library_last_successful_refresh: ((inputs?: Library_Last_Successful_RefreshInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Last_Successful_RefreshInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Last_Successful_RefreshInputs = {};
