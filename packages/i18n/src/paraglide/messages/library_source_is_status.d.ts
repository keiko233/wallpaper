/**
* | output |
* | --- |
* | "{sourceName} is {status}" |
*
* @param {Library_Source_Is_StatusInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const library_source_is_status: ((inputs: Library_Source_Is_StatusInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Source_Is_StatusInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Source_Is_StatusInputs = {
    sourceName: NonNullable<unknown>;
    status: NonNullable<unknown>;
};
