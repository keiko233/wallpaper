/**
* | output |
* | --- |
* | "Remove {name}?" |
*
* @param {Library_Remove_Source_TitleInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const library_remove_source_title: ((inputs: Library_Remove_Source_TitleInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Remove_Source_TitleInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Remove_Source_TitleInputs = {
    name: NonNullable<unknown>;
};
