/**
* | output |
* | --- |
* | "Update all" |
*
* @param {Library_Update_AllInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const library_update_all: ((inputs?: Library_Update_AllInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Update_AllInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Update_AllInputs = {};
