const puppeteer = require('puppeteer');
const generateInspectionPDF = async (booking, answers) => {
    const sectionMap = {};
    const serviceChecklist = booking.service?.checklist || [];
    answers.forEach(answer => {
        let sectionName = 'General';
        for (const section of serviceChecklist) {
            const found = section.questions.find(q => q.questionText === answer.questionText);
            if (found) {
                sectionName = section.sectionName || 'General';
                break;
            }
        }
        if (!sectionMap[sectionName]) {
            sectionMap[sectionName] = [];
        }
        sectionMap[sectionName].push(answer);
    });
    const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <style>
            body { 
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                margin: 0; 
                padding: 30px; 
                color: #2c3e50;
                line-height: 1.6;
            }
            .report-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 3px solid #3498db;
                padding-bottom: 20px;
                margin-bottom: 30px;
            }
            .report-title {
                margin: 0;
                color: #2c3e50;
                font-size: 28px;
                font-weight: bold;
                text-transform: uppercase;
            }
            .info-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
                margin-bottom: 40px;
            }
            .info-card {
                background: #f8f9fa;
                padding: 15px;
                border-radius: 8px;
                border: 1px solid #e9ecef;
            }
            .info-card h3 {
                margin-top: 0;
                margin-bottom: 10px;
                color: #3498db;
                font-size: 16px;
                border-bottom: 1px solid #dee2e6;
                padding-bottom: 5px;
            }
            .info-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 5px;
                font-size: 14px;
            }
            .info-label {
                font-weight: 600;
                color: #7f8c8d;
            }
            .info-value {
                font-weight: 500;
            }
            table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 30px;
                font-size: 13px;
            }
            th, td {
                border: 1px solid #dee2e6;
                padding: 12px 10px;
                text-align: left;
            }
            th {
                background-color: #3498db;
                color: white;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            tr:nth-child(even) {
                background-color: #f8f9fa;
            }
            .section-header {
                background-color: #ecf0f1;
                font-weight: bold;
                color: #2c3e50;
            }
            .remark-text {
                font-style: italic;
                color: #7f8c8d;
                font-size: 12px;
            }
            .images-container {
                margin-top: 40px;
                page-break-before: always;
            }
            .image-grid {
                display: flex;
                flex-wrap: wrap;
                gap: 15px;
                margin-top: 20px;
            }
            .image-item {
                border: 1px solid #ddd;
                padding: 5px;
                border-radius: 5px;
            }
            .approval-section {
                margin-top: 50px;
                padding-top: 20px;
                border-top: 2px dashed #95a5a6;
                text-align: right;
            }
            .status-approved {
                color: #27ae60;
                font-weight: bold;
                font-size: 18px;
                border: 2px solid #27ae60;
                padding: 10px 20px;
                display: inline-block;
                border-radius: 4px;
                transform: rotate(-3deg);
            }
        </style>
    </head>
    <body>
        <div class="report-header">
            <h1 class="report-title">Inspection Report</h1>
            <div style="text-align: right">
                <div style="font-weight: bold; font-size: 18px;">Zentroverse</div>
                <div style="font-size: 12px; color: #7f8c8d;">Reliable Vehicle Inspections</div>
            </div>
        </div>
        <div class="info-grid">
            <div class="info-card">
                <h3>Vehicle Details</h3>
                <div class="info-row"><span class="info-label">Registration No:</span> <span class="info-value">${booking.vehicleDetails?.registrationNumber || 'N/A'}</span></div>
                <div class="info-row"><span class="info-label">Model:</span> <span class="info-value">${booking.vehicleDetails?.model || 'N/A'}</span></div>
                <div class="info-row"><span class="info-label">Variant:</span> <span class="info-value">${booking.vehicleDetails?.variant || 'N/A'}</span></div>
            </div>
            <div class="info-card">
                <h3>Inspection Details</h3>
                <div class="info-row"><span class="info-label">Date:</span> <span class="info-value">${new Date(booking.updatedAt).toLocaleDateString()}</span></div>
                <div class="info-row"><span class="info-label">Service:</span> <span class="info-value">${booking.service?.name || 'N/A'}</span></div>
                <div class="info-row"><span class="info-label">Inspector:</span> <span class="info-value">${booking.inspector?.name || 'N/A'}</span></div>
            </div>
        </div>
        <table>
            <thead>
                <tr>
                    <th style="width: 15%;">Section</th>
                    <th style="width: 45%;">Question</th>
                    <th style="width: 15%;">Answer</th>
                    <th style="width: 25%;">Remark</th>
                </tr>
            </thead>
            <tbody>
                ${Object.entries(sectionMap).map(([sectionName, sectionAnswers]) => `
                    ${sectionAnswers.map((ans, index) => `
                        <tr>
                            ${index === 0 ? `<td rowspan="${sectionAnswers.length}" class="section-header">${sectionName}</td>` : ''}
                            <td>${ans.questionText}</td>
                            <td style="font-weight: bold; color: ${ans.selectedOption.toLowerCase() === 'ok' || ans.selectedOption.toLowerCase() === 'yes' ? '#27ae60' : '#e74c3c'};">${ans.selectedOption}</td>
                            <td class="remark-text">${ans.remark || '-'}</td>
                        </tr>
                    `).join('')}
                `).join('')}
            </tbody>
        </table>
        <div class="images-container">
            <h2 style="border-bottom: 2px solid #3498db; padding-bottom: 5px;">Inspection Images</h2>
            <div class="image-grid">
                ${answers.filter(a => a.imageUrl).map(a => `
                    <div class="image-item">
                        <img src="${a.imageUrl}" style="width:200px; height:150px; object-fit:cover;" />
                    </div>
                `).join('')}
                ${answers.filter(a => a.imageUrl).length === 0 ? '<p style="color: #7f8c8d;">No images attached to this report.</p>' : ''}
            </div>
        </div>
        ${booking.status === 'APPROVED' && booking.approvedBy ? `
            <div class="approval-section">
                <div style="margin-bottom: 10px; color: #7f8c8d;">Electronically Verified By</div>
                <div class="status-approved">APPROVED: ${booking.approvedBy.name.toUpperCase()}</div>
                <div style="font-size: 11px; margin-top: 5px; color: #bdc3c7;">Date: ${new Date(booking.updatedAt).toLocaleString()}</div>
            </div>
        ` : ''}
    </body>
    </html>
    `;
    const fs = require('fs');
    let browser;
    
    if (process.env.VERCEL) {
        const chromium = require('@sparticuz/chromium');
        const puppeteerCore = require('puppeteer-core');
        
        browser = await puppeteerCore.launch({
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath(),
            headless: chromium.headless,
        });
    } else {
        let executablePath;
        const paths = [
            'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
            'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
            'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
            'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
        ];
        for (const p of paths) {
            if (fs.existsSync(p)) {
                executablePath = p;
                break;
            }
        }
        browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            headless: true,
            executablePath: executablePath 
        });
    }
    try {
        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: 'domcontentloaded', timeout: 0 });
        const pdf = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '20mm',
                right: '15mm',
                bottom: '20mm',
                left: '15mm'
            }
        });
        return pdf;
    } finally {
        await browser.close();
    }
};
module.exports = { generateInspectionPDF };
