/**
* | output |
* | --- |
* | "Verifying SHA-256" |
*
* @param {Library_Progress_VerifyingInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const library_progress_verifying: ((inputs?: Library_Progress_VerifyingInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Progress_VerifyingInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Progress_VerifyingInputs = {};
