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
            const doc = new PDFDocument({ margin: 50, size: 'A4' });
            const buffers = [];
            
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                const pdfData = Buffer.concat(buffers);
                resolve(pdfData);
            });

            // Header
            doc.fontSize(24).fillColor('#2c3e50').text('INSPECTION REPORT', { align: 'left' });
            doc.moveUp();
            doc.fontSize(16).fillColor('#3498db').text('Zentroverse', { align: 'right' });
            doc.fontSize(10).fillColor('#7f8c8d').text('Reliable Vehicle Inspections', { align: 'right' });
            doc.moveDown(2);

            // Vehicle Details
            doc.fontSize(14).fillColor('#3498db').text('Vehicle Details', { underline: true });
            doc.moveDown(0.5);
            doc.fontSize(10).fillColor('#2c3e50');
            doc.text(`Registration No: ${booking.vehicleDetails?.registrationNumber || 'N/A'}`);
            doc.text(`Model: ${booking.vehicleDetails?.model || 'N/A'}`);
            doc.text(`Variant: ${booking.vehicleDetails?.variant || 'N/A'}`);
            doc.moveDown(1);

            // Inspection Details
            doc.fontSize(14).fillColor('#3498db').text('Inspection Details', { underline: true });
            doc.moveDown(0.5);
            doc.fontSize(10).fillColor('#2c3e50');
            doc.text(`Date: ${new Date(booking.updatedAt).toLocaleDateString()}`);
            doc.text(`Service: ${booking.service?.name || 'N/A'}`);
            doc.text(`Inspector: ${booking.inspector?.name || 'N/A'}`);
            doc.moveDown(2);

            // Group answers by section
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

            // Sections
            for (const [sectionName, sectionAnswers] of Object.entries(sectionMap)) {
                doc.fontSize(12).fillColor('#34495e').text(sectionName, { underline: true });
                doc.moveDown(0.5);
                
                sectionAnswers.forEach(ans => {
                    const isOk = ans.selectedOption.toLowerCase() === 'ok' || ans.selectedOption.toLowerCase() === 'yes' || ans.selectedOption.toLowerCase() === 'pass';
                    const color = isOk ? '#27ae60' : '#e74c3c';
                    
                    doc.fontSize(10).fillColor('#2c3e50').text(`• ${ans.questionText}`);
                    doc.fontSize(10).fillColor(color).text(`  Result: ${ans.selectedOption}`);
                    if (ans.remark) {
                        doc.fontSize(9).fillColor('#7f8c8d').text(`  Remark: ${ans.remark}`);
                    }
                    doc.moveDown(0.5);
                });
                doc.moveDown(1);
            }

            // Approval
            if (booking.status === 'APPROVED' && booking.approvedBy) {
                doc.moveDown(2);
                doc.fontSize(14).fillColor('#27ae60').text('APPROVED', { align: 'right' });
                doc.fontSize(10).fillColor('#7f8c8d').text(`By: ${booking.approvedBy.name.toUpperCase()}`, { align: 'right' });
                doc.text(`Date: ${new Date(booking.updatedAt).toLocaleString()}`, { align: 'right' });
            }

            // Images
            const images = answers.filter(a => a.imageUrl);
            if (images.length > 0) {
                doc.addPage();
                doc.fontSize(16).fillColor('#3498db').text('Inspection Images', { underline: true });
                doc.moveDown(2);
                
                let y = doc.y;
                for (const img of images) {
                    try {
                        const imgBuffer = await fetchImage(img.imageUrl);
                        if (imgBuffer) {
                            if (y > 650) { doc.addPage(); y = doc.y; }
                            doc.image(imgBuffer, 50, y, { fit: [200, 150] });
                            doc.fontSize(10).fillColor('#2c3e50').text(img.questionText, 260, y + 70);
                            y += 170;
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
