```js
const PDFDocument = require('pdfkit');
const https = require('https');
const http = require('http');

const fetchImage = (url) => new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;

    client.get(url, (res) => {
        if (res.statusCode !== 200) {
            resolve(null);
            return;
        }

        const data = [];
        res.on('data', chunk => data.push(chunk));
        res.on('end', () => resolve(Buffer.concat(data)));
    }).on('error', () => resolve(null));
});

const generateInspectionPDF = async (booking, answers) => {
    return new Promise(async (resolve, reject) => {
        try {
            const doc = new PDFDocument({
                margin: 50,
                size: 'A4'
            });

            const buffers = [];

            doc.on('data', buffers.push.bind(buffers));

            doc.on('end', () => {
                const pdfData = Buffer.concat(buffers);
                resolve(pdfData);
            });

            const colors = {
                primary: '#1f4e79',
                primaryLight: '#eaf2f8',
                dark: '#1f2937',
                text: '#374151',
                muted: '#6b7280',
                border: '#d9e1e8',
                background: '#f7f9fb',
                success: '#16803c',
                successBg: '#eaf7ef',
                danger: '#c0392b',
                dangerBg: '#fdeeee',
                white: '#ffffff'
            };

            const drawLine = (y, color = colors.border) => {
                doc
                    .strokeColor(color)
                    .lineWidth(0.7)
                    .moveTo(50, y)
                    .lineTo(545, y)
                    .stroke();
            };

            const drawSectionHeader = (title) => {
                doc
                    .roundedRect(50, doc.y, 495, 30, 6)
                    .fill(colors.primaryLight);

                doc
                    .fontSize(12)
                    .fillColor(colors.primary)
                    .font('Helvetica-Bold')
                    .text(title, 64, doc.y - 22);

                doc.moveDown(1.1);
            };

            const drawInfoBox = (label, value, x, y, width) => {
                doc
                    .roundedRect(x, y, width, 50, 6)
                    .fillAndStroke(colors.background, colors.border);

                doc
                    .fontSize(8)
                    .fillColor(colors.muted)
                    .font('Helvetica-Bold')
                    .text(label.toUpperCase(), x + 12, y + 10);

                doc
                    .fontSize(10)
                    .fillColor(colors.dark)
                    .font('Helvetica')
                    .text(value, x + 12, y + 26, {
                        width: width - 24
                    });
            };

            const addPageNumber = () => {
                const currentY = doc.page.height - 35;

                doc
                    .fontSize(8)
                    .fillColor(colors.muted)
                    .font('Helvetica')
                    .text(
                        `Zentroverse • Vehicle Inspection Report`,
                        50,
                        currentY,
                        {
                            width: 300,
                            align: 'left'
                        }
                    );

                doc
                    .fontSize(8)
                    .fillColor(colors.muted)
                    .text(
                        `Page ${doc.bufferedPageRange().count}`,
                        450,
                        currentY,
                        {
                            width: 95,
                            align: 'right'
                        }
                    );
            };

            doc
                .rect(0, 0, doc.page.width, 95)
                .fill(colors.primary);

            doc
                .fontSize(24)
                .fillColor(colors.white)
                .font('Helvetica-Bold')
                .text('INSPECTION REPORT', 50, 30);

            doc
                .fontSize(16)
                .fillColor(colors.white)
                .font('Helvetica-Bold')
                .text('Zentroverse', 390, 30, {
                    width: 155,
                    align: 'right'
                });

            doc
                .fontSize(9)
                .fillColor('#dbeafe')
                .font('Helvetica')
                .text('Reliable Vehicle Inspections', 390, 52, {
                    width: 155,
                    align: 'right'
                });

            doc.y = 120;

            drawSectionHeader('Vehicle Details');

            const vehicleY = doc.y;

            drawInfoBox(
                'Registration Number',
                booking.vehicleDetails?.registrationNumber || 'N/A',
                50,
                vehicleY,
                155
            );

            drawInfoBox(
                'Model',
                booking.vehicleDetails?.model || 'N/A',
                220,
                vehicleY,
                155
            );

            drawInfoBox(
                'Variant',
                booking.vehicleDetails?.variant || 'N/A',
                390,
                vehicleY,
                155
            );

            doc.y = vehicleY + 70;

            drawSectionHeader('Inspection Details');

            const inspectionY = doc.y;

            drawInfoBox(
                'Inspection Date',
                new Date(booking.updatedAt).toLocaleDateString(),
                50,
                inspectionY,
                155
            );

            drawInfoBox(
                'Service',
                booking.service?.name || 'N/A',
                220,
                inspectionY,
                155
            );

            drawInfoBox(
                'Inspector',
                booking.inspector?.name || 'N/A',
                390,
                inspectionY,
                155
            );

            doc.y = inspectionY + 75;

            const sectionMap = {};
            const serviceChecklist = booking.service?.checklist || [];

            answers.forEach(answer => {
                let sectionName = 'General';

                for (const section of serviceChecklist) {
                    const found = section.questions.find(
                        q => q.questionText === answer.questionText
                    );

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

            for (const [sectionName, sectionAnswers] of Object.entries(sectionMap)) {

                if (doc.y > 690) {
                    doc.addPage();
                    doc.y = 50;
                }

                drawSectionHeader(sectionName);

                sectionAnswers.forEach(ans => {

                    const isOk =
                        ans.selectedOption.toLowerCase() === 'ok' ||
                        ans.selectedOption.toLowerCase() === 'yes' ||
                        ans.selectedOption.toLowerCase() === 'pass';

                    const statusColor = isOk
                        ? colors.success
                        : colors.danger;

                    const statusBg = isOk
                        ? colors.successBg
                        : colors.dangerBg;

                    const startY = doc.y;

                    doc
                        .roundedRect(50, startY, 495, 58, 6)
                        .fillAndStroke(colors.white, colors.border);

                    doc
                        .fontSize(9.5)
                        .fillColor(colors.dark)
                        .font('Helvetica-Bold')
                        .text(
                            ans.questionText,
                            63,
                            startY + 10,
                            {
                                width: 315
                            }
                        );

                    doc
                        .roundedRect(405, startY + 10, 125, 24, 12)
                        .fill(statusBg);

                    doc
                        .fontSize(9)
                        .fillColor(statusColor)
                        .font('Helvetica-Bold')
                        .text(
                            ans.selectedOption,
                            410,
                            startY + 17,
                            {
                                width: 115,
                                align: 'center'
                            }
                        );

                    if (ans.remark) {
                        doc
                            .fontSize(8.5)
                            .fillColor(colors.muted)
                            .font('Helvetica')
                            .text(
                                `Remark: ${ans.remark}`,
                                63,
                                startY + 34,
                                {
                                    width: 320
                                }
                            );
                    }

                    doc.y = startY + 70;
                });

                doc.moveDown(0.5);
            }

            if (booking.status === 'APPROVED' && booking.approvedBy) {

                if (doc.y > 650) {
                    doc.addPage();
                    doc.y = 50;
                }

                doc.moveDown(1);

                const approvalY = doc.y;

                doc
                    .roundedRect(50, approvalY, 495, 85, 8)
                    .fill(colors.successBg)
                    .stroke(colors.success);

                doc
                    .fontSize(15)
                    .fillColor(colors.success)
                    .font('Helvetica-Bold')
                    .text(
                        '✓  APPROVED',
                        70,
                        approvalY + 18
                    );

                doc
                    .fontSize(9)
                    .fillColor(colors.muted)
                    .font('Helvetica')
                    .text(
                        `Approved by: ${booking.approvedBy.name.toUpperCase()}`,
                        70,
                        approvalY + 43
                    );

                doc
                    .fontSize(9)
                    .fillColor(colors.muted)
                    .text(
                        `Approval Date: ${new Date(booking.updatedAt).toLocaleString()}`,
                        70,
                        approvalY + 59
                    );

                doc.y = approvalY + 105;
            }

            const images = answers.filter(a => a.imageUrl);

            if (images.length > 0) {

                doc.addPage();

                doc
                    .fontSize(18)
                    .fillColor(colors.primary)
                    .font('Helvetica-Bold')
                    .text('Inspection Images');

                doc.moveDown(0.5);

                drawLine(doc.y);

                doc.moveDown(1);

                let y = doc.y;

                for (const img of images) {

                    try {

                        const imgBuffer = await fetchImage(img.imageUrl);

                        if (imgBuffer) {

                            if (y > 650) {
                                doc.addPage();

                                doc
                                    .fontSize(18)
                                    .fillColor(colors.primary)
                                    .font('Helvetica-Bold')
                                    .text('Inspection Images');

                                doc.moveDown(1);

                                y = doc.y;
                            }

                            doc
                                .roundedRect(50, y, 495, 165, 8)
                                .fillAndStroke(colors.background, colors.border);

                            doc.image(
                                imgBuffer,
                                62,
                                y + 8,
                                {
                                    fit: [205, 145],
                                    align: 'center',
                                    valign: 'center'
                                }
                            );

                            doc
                                .fontSize(10)
                                .fillColor(colors.dark)
                                .font('Helvetica-Bold')
                                .text(
                                    img.questionText,
                                    285,
                                    y + 45,
                                    {
                                        width: 235
                                    }
                                );

                            y += 180;
                        }

                    } catch (e) {
                        console.error(
                            'Error fetching image for PDF:',
                            e
                        );
                    }
                }
            }

            const range = doc.bufferedPageRange();

            for (let i = range.start; i < range.start + range.count; i++) {
                doc.switchToPage(i);
                addPageNumber();
            }

            doc.end();

        } catch (error) {
            reject(error);
        }
    });
};

module.exports = {
    generateInspectionPDF
};
```
