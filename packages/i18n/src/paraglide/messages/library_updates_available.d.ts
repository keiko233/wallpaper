/**
* | output |
* | --- |
* | "{count} updates available — versions are refreshed from the catalog." |
*
* @param {Library_Updates_AvailableInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const library_updates_available: ((inputs: Library_Updates_AvailableInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Updates_AvailableInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Updates_AvailableInputs = {
    count: NonNullable<unknown>;
};
