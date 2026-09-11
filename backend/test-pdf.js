const { generateInspectionPDF } = require('./src/utils/pdfGenerator');

(async () => {
    try {
        console.log('Testing pdfGenerator...');
        const pdf = await generateInspectionPDF({ 
            updatedAt: new Date(), 
            status: 'COMPLETED',
            vehicleDetails: {},
            service: { name: 'Test' },
            inspector: { name: 'Test Inspector' }
        }, [
            { questionText: 'Q1', selectedOption: 'Yes', remark: '' }
        ]);
        console.log('PDF generated, size:', pdf.length);
    } catch (error) {
        console.error('Error generating PDF:', error);
    }
})();
