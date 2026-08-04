/**
* | output |
* | --- |
* | "Delete installed resources" |
*
* @param {Library_Delete_Installed_ResourcesInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const library_delete_installed_resources: ((inputs?: Library_Delete_Installed_ResourcesInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Delete_Installed_ResourcesInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Delete_Installed_ResourcesInputs = {};
