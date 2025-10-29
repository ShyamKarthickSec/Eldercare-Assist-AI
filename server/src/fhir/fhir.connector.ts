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
      // Handle both simple observations and components (like BP)
      let observationDetail = '';
      if (resource.component && resource.component.length > 0) {
        // Component observation (e.g., Blood Pressure)
        observationDetail = resource.component
          .map((c: any) => 
            `${c.code?.coding?.[0]?.display || c.code?.text || 'Component'}: ${c.valueQuantity?.value || 'N/A'} ${c.valueQuantity?.unit || ''}`
          )
          .join(', ');
      } else if (resource.valueQuantity) {
        observationDetail = `Value: ${resource.valueQuantity.value} ${resource.valueQuantity.unit || ''}`;
      } else if (resource.valueString) {
        observationDetail = `Value: ${resource.valueString}`;
      }
      
      await addTimelineEvent(
        patientId,
        TimelineKind.CLINIC,
        `${resource.code?.text || resource.code?.coding?.[0]?.display || 'Clinical Observation'}`,
        observationDetail,
        resource.id
      );
      break;
      
    case 'MedicationStatement':
      const dosage = resource.dosage?.[0]?.text || `${resource.dosage?.[0]?.doseAndRate?.[0]?.doseQuantity?.value || ''} ${resource.dosage?.[0]?.doseAndRate?.[0]?.doseQuantity?.unit || ''}`;
      await addTimelineEvent(
        patientId,
        TimelineKind.CLINIC,
        `Medication: ${resource.medicationCodeableConcept?.text || resource.medicationCodeableConcept?.coding?.[0]?.display || 'Unknown'}`,
        `Status: ${resource.status}${dosage ? ` • Dosage: ${dosage}` : ''}`,
        resource.id
      );
      break;
      
    case 'Encounter':
      const encounterType = resource.type?.[0]?.text || resource.type?.[0]?.coding?.[0]?.display || 'Healthcare Visit';
      const encounterDate = resource.period?.start ? new Date(resource.period.start).toLocaleDateString() : 'N/A';
      await addTimelineEvent(
        patientId,
        TimelineKind.CLINIC,
        `${encounterType}`,
        `Visit on ${encounterDate}${resource.participant?.[0] ? ` with ${resource.participant[0].individual?.reference?.split('/')?.[1] || 'Healthcare Provider'}` : ''}`,
        resource.id
      );
      break;
      
    case 'Condition':
      const conditionStatus = resource.clinicalStatus?.coding?.[0]?.code || 'unknown';
      const onsetDate = resource.onsetDateTime ? new Date(resource.onsetDateTime).toLocaleDateString() : 'Unknown date';
      await addTimelineEvent(
        patientId,
        TimelineKind.CLINIC,
        `Diagnosis: ${resource.code?.text || resource.code?.coding?.[0]?.display || 'Condition'}`,
        `Status: ${conditionStatus} • Onset: ${onsetDate}`,
        resource.id
      );
      break;
      
    case 'DiagnosticReport':
      const resultCount = resource.result?.length || 0;
      await addTimelineEvent(
        patientId,
        TimelineKind.CLINIC,
        `Lab Report: ${resource.code?.text || resource.code?.coding?.[0]?.display || 'Diagnostic Report'}`,
        `${resultCount} test result(s)${resource.conclusion ? ` • ${resource.conclusion}` : ''}`,
        resource.id
      );
      break;
      
    case 'Immunization':
      const vaccineDate = resource.occurrenceDateTime ? new Date(resource.occurrenceDateTime).toLocaleDateString() : 'N/A';
      await addTimelineEvent(
        patientId,
        TimelineKind.CLINIC,
        `Immunization: ${resource.vaccineCode?.text || resource.vaccineCode?.coding?.[0]?.display || 'Vaccine'}`,
        `Administered on ${vaccineDate}`,
        resource.id
      );
      break;
      
    case 'AllergyIntolerance':
      const criticality = resource.criticality || 'unknown';
      await addTimelineEvent(
        patientId,
        TimelineKind.CLINIC,
        `Allergy: ${resource.code?.text || resource.code?.coding?.[0]?.display || 'Unknown Allergen'}`,
        `Severity: ${criticality} • Type: ${resource.type || 'allergy'}`,
        resource.id
      );
      break;
      
    case 'CarePlan':
      const activityCount = resource.activity?.length || 0;
      await addTimelineEvent(
        patientId,
        TimelineKind.CLINIC,
        `Care Plan: ${resource.title || 'Patient Care Plan'}`,
        `${resource.description || ''} • ${activityCount} activit${activityCount === 1 ? 'y' : 'ies'}`,
        resource.id
      );
      break;
      
    // Silently skip resource types we don't process for timeline
    case 'Practitioner':
    case 'Patient':
      // These are reference data, not clinical events
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
