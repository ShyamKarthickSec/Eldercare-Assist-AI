/**
 * Script to generate rich FHIR sample data files
 * Run this to create comprehensive FHIR R4 sample data
 */
import * as fs from 'fs';
import * as path from 'path';
import { FHIRDataGenerator } from './fhir.generator';

export const generateFHIRSamplesForPatient = (patientId: string, patientName: string) => {
  console.log(`[FHIR] Generating comprehensive FHIR R4 sample data for ${patientName}...`);
  
  const generator = new FHIRDataGenerator(patientId);
  const bundle = generator.generateAll();
  
  const samplesDir = path.join(__dirname, '../../data/fhir_samples');
  if (!fs.existsSync(samplesDir)) {
    fs.mkdirSync(samplesDir, { recursive: true });
  }
  
  // Save the comprehensive bundle
  const filename = `${patientId}-comprehensive-bundle.json`;
  const filepath = path.join(samplesDir, filename);
  
  fs.writeFileSync(filepath, JSON.stringify(bundle, null, 2), 'utf-8');
  
  console.log(`[FHIR] ✅ Generated ${bundle.entry.length} FHIR resources for ${patientName}`);
  console.log(`[FHIR] ✅ Saved to: ${filename}`);
  
  // Summary
  const resourceTypes: { [key: string]: number } = {};
  bundle.entry.forEach(entry => {
    const type = entry.resource.resourceType;
    resourceTypes[type] = (resourceTypes[type] || 0) + 1;
  });
  
  console.log('[FHIR] 📊 Resource Summary:');
  Object.entries(resourceTypes).sort().forEach(([type, count]) => {
    console.log(`[FHIR]    ${type}: ${count}`);
  });
  
  return {
    filename,
    resourceCount: bundle.entry.length,
    resourceTypes
  };
};

