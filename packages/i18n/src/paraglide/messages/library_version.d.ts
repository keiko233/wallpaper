/**
* | output |
* | --- |
* | "Version {version}" |
*
* @param {Library_VersionInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const library_version: ((inputs: Library_VersionInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_VersionInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_VersionInputs = {
    version: NonNullable<unknown>;
};
