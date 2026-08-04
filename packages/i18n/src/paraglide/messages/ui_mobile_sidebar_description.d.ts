/**
* | output |
* | --- |
* | "Displays the mobile sidebar." |
*
* @param {Ui_Mobile_Sidebar_DescriptionInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const ui_mobile_sidebar_description: ((inputs?: Ui_Mobile_Sidebar_DescriptionInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ui_Mobile_Sidebar_DescriptionInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ui_Mobile_Sidebar_DescriptionInputs = {};
