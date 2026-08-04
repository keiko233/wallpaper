/**
* | output |
* | --- |
* | "Downloading artifact" |
*
* @param {Library_Progress_DownloadingInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const library_progress_downloading: ((inputs?: Library_Progress_DownloadingInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Progress_DownloadingInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Progress_DownloadingInputs = {};
