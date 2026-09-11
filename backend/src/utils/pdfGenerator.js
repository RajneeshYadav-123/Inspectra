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

            // STYLING: Grouped colors into a cohesive, modern UI theme
            const theme = {
                primary: '#0F172A',      // Slate 900
                secondary: '#3B82F6',    // Blue 500
                dark: '#1E293B',         // Slate 800
                muted: '#64748B',        // Slate 500
                border: '#E2E8F0',       // Slate 200
                light: '#F8FAFC',        // Slate 50
                surface: '#F1F5F9',      // Slate 100
                success: '#15803D',      // Green 700
                successLight: '#DCFCE7', // Green 100
                danger: '#B91C1C',       // Red 700
                dangerLight: '#FEE2E2',  // Red 100
                white: '#FFFFFF'
            };

            // --- REUSABLE PDF COMPONENTS --- //

            const drawSection = (title) => {
                const y = doc.y;

                doc.roundedRect(50, y, 495, 32, 6)
                   .fill(theme.surface);

                doc.font('Helvetica-Bold')
                   .fontSize(11)
                   .fillColor(theme.primary)
                   .text(title.toUpperCase(), 65, y + 10, { tracking: 1 });

                doc.y = y + 45;
            };

            const drawInfoBox = (label, value, x, y, width) => {
                doc.roundedRect(x, y, width, 52, 6)
                   .fillAndStroke(theme.light, theme.border);

                doc.font('Helvetica-Bold')
                   .fontSize(7.5)
                   .fillColor(theme.muted)
                   .text(label.toUpperCase(), x + 12, y + 10, { width: width - 24 });

                doc.font('Helvetica')
                   .fontSize(10)
                   .fillColor(theme.dark)
                   .text(value, x + 12, y + 26, { width: width - 24 });
            };

            const drawSeparator = () => {
                doc.strokeColor(theme.border)
                   .lineWidth(1)
                   .moveTo(50, doc.y)
                   .lineTo(545, doc.y)
                   .stroke();
            };

            // --- HEADER --- //

            doc.rect(0, 0, doc.page.width, 100)
               .fill(theme.primary);

            doc.font('Helvetica-Bold')
               .fontSize(24)
               .fillColor(theme.white)
               .text('INSPECTION REPORT', 50, 32);

            doc.font('Helvetica-Bold')
               .fontSize(16)
               .fillColor(theme.white)
               .text('Zentroverse', 390, 30, { width: 155, align: 'right' });

            doc.font('Helvetica')
               .fontSize(9)
               .fillColor(theme.muted)
               .text('Reliable Vehicle Inspections', 390, 52, { width: 155, align: 'right' });

            doc.y = 125;

            // --- VEHICLE DETAILS --- //

            drawSection('Vehicle Details');
            const vehicleY = doc.y;

            drawInfoBox('Registration Number', booking.vehicleDetails?.registrationNumber || 'N/A', 50, vehicleY, 155);
            drawInfoBox('Model', booking.vehicleDetails?.model || 'N/A', 220, vehicleY, 155);
            drawInfoBox('Variant', booking.vehicleDetails?.variant || 'N/A', 390, vehicleY, 155);

            doc.y = vehicleY + 72;

            // --- INSPECTION DETAILS --- //

            drawSection('Inspection Details');
            const inspectionY = doc.y;

            drawInfoBox('Inspection Date', new Date(booking.updatedAt).toLocaleDateString(), 50, inspectionY, 155);
            drawInfoBox('Service', booking.service?.name || 'N/A', 220, inspectionY, 155);
            drawInfoBox('Inspector', booking.inspector?.name || 'N/A', 390, inspectionY, 155);

            doc.y = inspectionY + 80;

            // --- CHECKLIST --- //

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

                if (!sectionMap[sectionName]) sectionMap[sectionName] = [];
                sectionMap[sectionName].push(answer);
            });

            for (const [sectionName, sectionAnswers] of Object.entries(sectionMap)) {
                if (doc.y > 690) {
                    doc.addPage();
                    doc.y = 50;
                }

                drawSection(sectionName);

                sectionAnswers.forEach(ans => {
                    const ansLower = ans.selectedOption.toLowerCase();
                    const isOk = ansLower === 'ok' || ansLower === 'yes' || ansLower === 'pass';

                    const color = isOk ? theme.success : theme.danger;
                    const statusBackground = isOk ? theme.successLight : theme.dangerLight;

                    const cardY = doc.y;

                    doc.roundedRect(50, cardY, 495, 64, 6)
                       .fillAndStroke(theme.white, theme.border);

                    doc.font('Helvetica-Bold')
                       .fontSize(10)
                       .fillColor(theme.dark)
                       .text(ans.questionText, 65, cardY + 12, { width: 315, lineGap: 2 });

                    doc.roundedRect(405, cardY + 12, 125, 24, 12)
                       .fill(statusBackground);

                    doc.font('Helvetica-Bold')
                       .fontSize(9)
                       .fillColor(color)
                       .text(ans.selectedOption.toUpperCase(), 410, cardY + 19, { width: 115, align: 'center', tracking: 1 });

                    if (ans.remark) {
                        doc.font('Helvetica')
                           .fontSize(8.5)
                           .fillColor(theme.muted)
                           .text(`Remark: ${ans.remark}`, 65, cardY + 40, { width: 320 });
                    }

                    doc.y = cardY + 76;
                });

                doc.moveDown(0.5);
            }

            // --- APPROVAL BADGE --- //

            if (booking.status === 'APPROVED' && booking.approvedBy) {
                doc.moveDown(1);
                const approvalY = doc.y;

                doc.roundedRect(50, approvalY, 495, 82, 8)
                   .fillAndStroke(theme.successLight, theme.success);

                doc.font('Helvetica-Bold')
                   .fontSize(14)
                   .fillColor(theme.success)
                   .text('APPROVED', 75, approvalY + 18, { tracking: 2 });

                doc.font('Helvetica')
                   .fontSize(9.5)
                   .fillColor(theme.success)
                   .text(`By: ${booking.approvedBy.name.toUpperCase()}`, 75, approvalY + 44);

                doc.fontSize(9.5)
                   .fillColor(theme.success)
                   .text(`Date: ${new Date(booking.updatedAt).toLocaleString()}`, 75, approvalY + 60);

                doc.y = approvalY + 100;
            }

            // --- IMAGES --- //

            const images = answers.filter(a => a.imageUrl);

            if (images.length > 0) {
                doc.addPage();

                doc.font('Helvetica-Bold')
                   .fontSize(18)
                   .fillColor(theme.primary)
                   .text('Inspection Images');

                doc.moveDown(0.5);
                drawSeparator();
                doc.moveDown(1.5);

                let y = doc.y;

                for (const img of images) {
                    try {
                        const imgBuffer = await fetchImage(img.imageUrl);

                        if (imgBuffer) {
                            if (y > 650) {
                                doc.addPage();
                                y = doc.y;
                            }

                            doc.roundedRect(50, y, 495, 175, 8)
                               .fillAndStroke(theme.light, theme.border);

                            doc.image(imgBuffer, 65, y + 12, {
                                fit: [200, 150],
                                align: 'center',
                                valign: 'center'
                            });

                            doc.font('Helvetica-Bold')
                               .fontSize(11)
                               .fillColor(theme.dark)
                               .text(img.questionText, 290, y + 60, { width: 230, lineGap: 4 });

                            y += 190;
                        }
                    } catch (e) {
                        console.error('Error fetching image for PDF:', e);
                    }
                }
            }

            doc.end();

        } catch (error) {
            reject(error);
        }
    });
};

module.exports = { generateInspectionPDF };