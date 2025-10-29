const fs = require('fs');
const path = require('path');
const htmlPdf = require('html-pdf-node');

async function testPDFGeneration() {
  console.log('🧪 Testing PDF generation...\n');
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head><title>Test Report</title></head>
    <body>
      <h1>Test PDF Report</h1>
      <p>This is a test to verify PDF generation works.</p>
      <p>Date: ${new Date().toLocaleString()}</p>
    </body>
    </html>
  `;
  
  try {
    const file = { content: html };
    const options = { format: 'A4' };
    
    console.log('📝 Generating PDF buffer...');
    const pdfBuffer = await htmlPdf.generatePdf(file, options);
    
    console.log('✅ PDF buffer generated successfully!');
    console.log(`   Buffer size: ${pdfBuffer.length} bytes`);
    
    const reportsDir = path.join(__dirname, 'reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    const testFile = path.join(reportsDir, 'test-report.pdf');
    fs.writeFileSync(testFile, pdfBuffer);
    
    console.log(`✅ PDF saved to: ${testFile}`);
    console.log('\n✨ PDF generation test PASSED!\n');
    
  } catch (error) {
    console.error('❌ PDF generation test FAILED:');
    console.error(error);
    process.exit(1);
  }
}

testPDFGeneration();

