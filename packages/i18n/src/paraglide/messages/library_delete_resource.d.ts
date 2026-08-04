/**
* | output |
* | --- |
* | "Delete resource" |
*
* @param {Library_Delete_ResourceInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const library_delete_resource: ((inputs?: Library_Delete_ResourceInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Delete_ResourceInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Delete_ResourceInputs = {};
