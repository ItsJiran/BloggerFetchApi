// +===============================================================+
// ------------------- BLOG SEARCH FUNCTIONS -----------------------
// +===============================================================+
function preg_match_all(regex, str) {
    regexs = [];
    while ((array1 = regex.exec(str)) !== null) {
        regexs.push(array1[0]);
    }
    return regexs;
}