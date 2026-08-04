/**
* | output |
* | --- |
* | "Delete {name}?" |
*
* @param {Library_Delete_Resource_TitleInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const library_delete_resource_title: ((inputs: Library_Delete_Resource_TitleInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Delete_Resource_TitleInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Delete_Resource_TitleInputs = {
    name: NonNullable<unknown>;
};
