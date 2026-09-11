const xlsx = require('xlsx');
const parseExcelFile = (buffer) => {
    const workbook = xlsx.read(buffer, { type: 'buffer' });
    const firstSheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[firstSheetName];
    const data = xlsx.utils.sheet_to_json(sheet);
    const checklistMap = {};
    let currentSection = "General";
    data.forEach((row) => {
        const section = row["Section"]?.toString().trim();
        const question = row["Question"]?.toString().trim();
        const option1 = row["Option 1"]?.toString().trim();
        const option2 = row["Option 2"]?.toString().trim();
        if (section) {
            currentSection = section;
        }
        if (!question) return;
        if (question.length < 5) return;
        const lowerQ = question.toLowerCase();
        const skipKeywords = ["customer", "email", "phone", "address", "question"];
        if (skipKeywords.some(keyword => lowerQ.includes(keyword))) {
            return;
        }
        const lowerS = currentSection.toLowerCase();
        const skipSections = ["auto", "report", "checksheet"];
        if (skipSections.some(s => lowerS.includes(s))) {
            return;
        }
        const options = [option1, option2].filter(Boolean);
        if (!checklistMap[currentSection]) {
            checklistMap[currentSection] = {
                sectionName: currentSection,
                questions: []
            };
        }
        checklistMap[currentSection].questions.push({
            questionText: question,
            options: options
        });
    });
    return Object.values(checklistMap);
};
module.exports = { parseExcelFile };
