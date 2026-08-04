/**
* | output |
* | --- |
* | "Update available: v{current} → v{next}" |
*
* @param {Library_Update_BadgeInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const library_update_badge: ((inputs: Library_Update_BadgeInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Update_BadgeInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Update_BadgeInputs = {
    current: NonNullable<unknown>;
    next: NonNullable<unknown>;
};
