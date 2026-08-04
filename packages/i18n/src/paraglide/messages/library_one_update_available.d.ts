/**
* | output |
* | --- |
* | "1 update available — versions are refreshed from the catalog." |
*
* @param {Library_One_Update_AvailableInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const library_one_update_available: ((inputs?: Library_One_Update_AvailableInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_One_Update_AvailableInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_One_Update_AvailableInputs = {};
