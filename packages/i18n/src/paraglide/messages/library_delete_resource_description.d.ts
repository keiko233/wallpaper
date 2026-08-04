/**
* | output |
* | --- |
* | "This removes the resource from the player and deletes its local files when they are not shared by another installed resource. The resource source remains con..." |
*
* @param {Library_Delete_Resource_DescriptionInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const library_delete_resource_description: ((inputs?: Library_Delete_Resource_DescriptionInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Delete_Resource_DescriptionInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Delete_Resource_DescriptionInputs = {};
