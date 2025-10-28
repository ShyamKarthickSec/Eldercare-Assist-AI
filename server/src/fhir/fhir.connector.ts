import * as fs from 'fs';
import * as path from 'path';
import { prisma } from '../prisma';
import { FhirSource, TimelineKind } from '../common/types';
import { addTimelineEvent } from '../timeline/timeline.service';

interface FHIRResource {
  resourceType: string;
  id?: string;
  [key: string]: any;
}

export const importFHIRData = async (patientId: string): Promise<{ items: number }> => {
  const fhirSamplesDir = path.join(__dirname, '../../data/fhir_samples');
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(fhirSamplesDir)) {
    fs.mkdirSync(fhirSamplesDir, { recursive: true });
    // Create sample FHIR data
    createSampleFHIRData(fhirSamplesDir);
  }
  
  let itemCount = 0;
  
  // Read all JSON files in the directory
  const files = fs.readdirSync(fhirSamplesDir).filter(f => f.endsWith('.json'));
  
  for (const file of files) {
    const filepath = path.join(fhirSamplesDir, file);
    const content = fs.readFileSync(filepath, 'utf-8');
    const data = JSON.parse(content);
    
    // Process based on resource type
    if (data.resourceType === 'Bundle' && data.entry) {
      for (const entry of data.entry) {
        if (entry.resource) {
          await processResource(patientId, entry.resource);
          itemCount++;
        }
      }
    } else {
      await processResource(patientId, data);
      itemCount++;
    }
  }
  
  // Create import record
  await prisma.fhirImport.create({
    data: {
      patientId,
      source: 'MOCK',
      bundleType: 'collection',
      items: itemCount,
    },
  });
  
  // Add to timeline
  await addTimelineEvent(
    patientId,
    TimelineKind.CLINIC,
    'Health Records Imported',
    `Imported ${itemCount} clinical records from My Health Record`,
    undefined
  );
  
  return { items: itemCount };
};

const processResource = async (patientId: string, resource: FHIRResource) => {
  switch (resource.resourceType) {
    case 'Observation':
      await addTimelineEvent(
        patientId,
        TimelineKind.CLINIC,
        `Observation: ${resource.code?.text || 'Clinical Observation'}`,
        `Value: ${resource.valueQuantity?.value || 'N/A'} ${resource.valueQuantity?.unit || ''}`,
        resource.id
      );
      break;
      
    case 'MedicationStatement':
      await addTimelineEvent(
        patientId,
        TimelineKind.CLINIC,
        `Medication: ${resource.medicationCodeableConcept?.text || 'Unknown'}`,
        `Status: ${resource.status || 'N/A'}`,
        resource.id
      );
      break;
      
    case 'Encounter':
      await addTimelineEvent(
        patientId,
        TimelineKind.CLINIC,
        `Encounter: ${resource.type?.[0]?.text || 'Healthcare Visit'}`,
        `Date: ${resource.period?.start || 'N/A'}`,
        resource.id
      );
      break;
  }
};

const createSampleFHIRData = (dir: string) => {
  const sampleBundle = {
    resourceType: 'Bundle',
    type: 'collection',
    entry: [
      {
        resource: {
          resourceType: 'Observation',
          id: 'obs-1',
          status: 'final',
          code: {
            text: 'Blood Pressure'
          },
          valueQuantity: {
            value: 120,
            unit: 'mmHg'
          }
        }
      },
      {
        resource: {
          resourceType: 'MedicationStatement',
          id: 'med-1',
          status: 'active',
          medicationCodeableConcept: {
            text: 'Lisinopril 10mg'
          }
        }
      },
      {
        resource: {
          resourceType: 'Encounter',
          id: 'enc-1',
          status: 'finished',
          type: [{
            text: 'Annual Check-up'
          }],
          period: {
            start: '2025-10-01T10:00:00Z'
          }
        }
      }
    ]
  };
  
  fs.writeFileSync(
    path.join(dir, 'sample-bundle.json'),
    JSON.stringify(sampleBundle, null, 2),
    'utf-8'
  );
};
