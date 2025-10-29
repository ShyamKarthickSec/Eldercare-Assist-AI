/**
 * FHIR R4 Sample Data Generator
 * Generates realistic, deterministic FHIR resources with proper coding systems
 * Uses LOINC, SNOMED CT, RxNorm, and UCUM standards
 */

interface DateRange {
  start: Date;
  end: Date;
}

// Deterministic random generator for reproducible data
class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  next(): number {
    const x = Math.sin(this.seed++) * 10000;
    return x - Math.floor(x);
  }

  range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }

  pick<T>(arr: T[]): T {
    return arr[Math.floor(this.next() * arr.length)];
  }

  date(start: Date, end: Date): Date {
    const startTime = start.getTime();
    const endTime = end.getTime();
    return new Date(startTime + this.next() * (endTime - startTime));
  }
}

export class FHIRDataGenerator {
  private rng: SeededRandom;
  private patientId: string;
  private practitionerIds: string[] = [];
  private encounterIds: string[] = [];
  private dateRange: DateRange;

  constructor(patientId: string, seed: number = 12345) {
    this.rng = new SeededRandom(seed);
    this.patientId = patientId;
    
    // Set date range: last 90 days
    this.dateRange = {
      end: new Date(),
      start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
    };
  }

  generateAll() {
    const practitioners = this.generatePractitioners();
    const encounters = this.generateEncounters();
    const conditions = this.generateConditions();
    const medications = this.generateMedications();
    const observations = this.generateObservations();
    const diagnosticReports = this.generateDiagnosticReports();
    const immunizations = this.generateImmunizations();
    const allergies = this.generateAllergies();
    const carePlan = this.generateCarePlan();

    return {
      resourceType: 'Bundle',
      type: 'collection',
      entry: [
        ...practitioners.map(r => ({ resource: r })),
        ...encounters.map(r => ({ resource: r })),
        ...conditions.map(r => ({ resource: r })),
        ...medications.map(r => ({ resource: r })),
        ...observations.map(r => ({ resource: r })),
        ...diagnosticReports.map(r => ({ resource: r })),
        ...immunizations.map(r => ({ resource: r })),
        ...allergies.map(r => ({ resource: r })),
        { resource: carePlan }
      ]
    };
  }

  private generatePractitioners() {
    const practitioners = [
      {
        resourceType: 'Practitioner',
        id: 'prac-smith',
        name: [{ family: 'Smith', given: ['Sarah'], prefix: ['Dr.'] }],
        qualification: [{ code: { text: 'General Practitioner' } }]
      },
      {
        resourceType: 'Practitioner',
        id: 'prac-nguyen',
        name: [{ family: 'Nguyen', given: ['Michael'], prefix: ['Dr.'] }],
        qualification: [{ code: { text: 'Endocrinology' } }]
      },
      {
        resourceType: 'Practitioner',
        id: 'prac-jones',
        name: [{ family: 'Jones', given: ['Emily'], prefix: ['Nurse'] }],
        qualification: [{ code: { text: 'Registered Nurse' } }]
      }
    ];
    
    this.practitionerIds = practitioners.map(p => p.id);
    return practitioners;
  }

  private generateEncounters() {
    const encounterTypes = [
      { code: '11429006', display: 'Office visit', text: 'Office Visit' },
      { code: '308335008', display: 'Patient encounter procedure', text: 'Check-up' },
      { code: '185349003', display: 'Telephone encounter', text: 'Telehealth Consultation' },
      { code: '439708006', display: 'Home visit', text: 'Home Health Visit' }
    ];

    const encounters = [];
    const encounterDates: Date[] = [];

    // Generate 8 encounters over 90 days
    for (let i = 0; i < 8; i++) {
      const date = this.rng.date(this.dateRange.start, this.dateRange.end);
      encounterDates.push(date);
    }
    encounterDates.sort((a, b) => a.getTime() - b.getTime());

    for (let i = 0; i < encounterDates.length; i++) {
      const encType = this.rng.pick(encounterTypes);
      const practitioner = this.rng.pick(this.practitionerIds);
      const encId = `enc-${i + 1}`;
      this.encounterIds.push(encId);

      encounters.push({
        resourceType: 'Encounter',
        id: encId,
        status: 'finished',
        class: {
          system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
          code: encType.code === '185349003' ? 'VR' : 'AMB'
        },
        type: [{
          coding: [{
            system: 'http://snomed.info/sct',
            code: encType.code,
            display: encType.display
          }],
          text: encType.text
        }],
        subject: { reference: `Patient/${this.patientId}` },
        participant: [{
          individual: { reference: `Practitioner/${practitioner}` }
        }],
        period: {
          start: encounterDates[i].toISOString(),
          end: new Date(encounterDates[i].getTime() + 30 * 60 * 1000).toISOString()
        }
      });
    }

    return encounters;
  }

  private generateConditions() {
    const conditions = [
      {
        resourceType: 'Condition',
        id: 'cond-hypertension',
        clinicalStatus: {
          coding: [{
            system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
            code: 'active'
          }]
        },
        code: {
          coding: [{
            system: 'http://snomed.info/sct',
            code: '38341003',
            display: 'Hypertensive disorder'
          }],
          text: 'Essential Hypertension'
        },
        subject: { reference: `Patient/${this.patientId}` },
        onsetDateTime: new Date(Date.now() - 365 * 3 * 24 * 60 * 60 * 1000).toISOString(),
        recordedDate: new Date(Date.now() - 365 * 3 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        resourceType: 'Condition',
        id: 'cond-diabetes',
        clinicalStatus: {
          coding: [{
            system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
            code: 'active'
          }]
        },
        code: {
          coding: [{
            system: 'http://snomed.info/sct',
            code: '44054006',
            display: 'Type 2 diabetes mellitus'
          }],
          text: 'Type 2 Diabetes Mellitus'
        },
        subject: { reference: `Patient/${this.patientId}` },
        onsetDateTime: new Date(Date.now() - 365 * 5 * 24 * 60 * 60 * 1000).toISOString(),
        recordedDate: new Date(Date.now() - 365 * 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        resourceType: 'Condition',
        id: 'cond-allergy-seasonal',
        clinicalStatus: {
          coding: [{
            system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
            code: 'active'
          }]
        },
        code: {
          coding: [{
            system: 'http://snomed.info/sct',
            code: '21719001',
            display: 'Allergic rhinitis'
          }],
          text: 'Seasonal Allergies'
        },
        subject: { reference: `Patient/${this.patientId}` },
        onsetDateTime: new Date(Date.now() - 365 * 10 * 24 * 60 * 60 * 1000).toISOString(),
        recordedDate: new Date(Date.now() - 365 * 10 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        resourceType: 'Condition',
        id: 'cond-bronchitis-resolved',
        clinicalStatus: {
          coding: [{
            system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
            code: 'resolved'
          }]
        },
        code: {
          coding: [{
            system: 'http://snomed.info/sct',
            code: '10509002',
            display: 'Acute bronchitis'
          }],
          text: 'Acute Bronchitis (Resolved)'
        },
        subject: { reference: `Patient/${this.patientId}` },
        onsetDateTime: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
        abatementDateTime: new Date(Date.now() - 105 * 24 * 60 * 60 * 1000).toISOString(),
        recordedDate: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    return conditions;
  }

  private generateMedications() {
    const medications = [
      {
        resourceType: 'MedicationStatement',
        id: 'med-metformin',
        status: 'active',
        medicationCodeableConcept: {
          coding: [{
            system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
            code: '860975',
            display: 'Metformin 500 MG Oral Tablet'
          }],
          text: 'Metformin 500mg'
        },
        subject: { reference: `Patient/${this.patientId}` },
        effectiveDateTime: new Date(Date.now() - 365 * 5 * 24 * 60 * 60 * 1000).toISOString(),
        dosage: [{
          text: '500mg twice daily with meals',
          timing: { repeat: { frequency: 2, period: 1, periodUnit: 'd' } },
          route: {
            coding: [{
              system: 'http://snomed.info/sct',
              code: '26643006',
              display: 'Oral route'
            }]
          },
          doseAndRate: [{
            doseQuantity: { value: 500, unit: 'mg', system: 'http://unitsofmeasure.org', code: 'mg' }
          }]
        }]
      },
      {
        resourceType: 'MedicationStatement',
        id: 'med-amlodipine',
        status: 'active',
        medicationCodeableConcept: {
          coding: [{
            system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
            code: '197361',
            display: 'Amlodipine 5 MG Oral Tablet'
          }],
          text: 'Amlodipine 5mg'
        },
        subject: { reference: `Patient/${this.patientId}` },
        effectiveDateTime: new Date(Date.now() - 365 * 3 * 24 * 60 * 60 * 1000).toISOString(),
        dosage: [{
          text: '5mg once daily',
          timing: { repeat: { frequency: 1, period: 1, periodUnit: 'd' } },
          route: {
            coding: [{
              system: 'http://snomed.info/sct',
              code: '26643006',
              display: 'Oral route'
            }]
          },
          doseAndRate: [{
            doseQuantity: { value: 5, unit: 'mg', system: 'http://unitsofmeasure.org', code: 'mg' }
          }]
        }]
      },
      {
        resourceType: 'MedicationStatement',
        id: 'med-lisinopril',
        status: 'active',
        medicationCodeableConcept: {
          coding: [{
            system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
            code: '314076',
            display: 'Lisinopril 10 MG Oral Tablet'
          }],
          text: 'Lisinopril 10mg'
        },
        subject: { reference: `Patient/${this.patientId}` },
        effectiveDateTime: new Date(Date.now() - 365 * 3 * 24 * 60 * 60 * 1000).toISOString(),
        dosage: [{
          text: '10mg once daily',
          timing: { repeat: { frequency: 1, period: 1, periodUnit: 'd' } },
          route: {
            coding: [{
              system: 'http://snomed.info/sct',
              code: '26643006',
              display: 'Oral route'
            }]
          },
          doseAndRate: [{
            doseQuantity: { value: 10, unit: 'mg', system: 'http://unitsofmeasure.org', code: 'mg' }
          }]
        }]
      },
      {
        resourceType: 'MedicationStatement',
        id: 'med-aspirin',
        status: 'active',
        medicationCodeableConcept: {
          coding: [{
            system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
            code: '243670',
            display: 'Aspirin 81 MG Oral Tablet'
          }],
          text: 'Aspirin 81mg (Low-Dose)'
        },
        subject: { reference: `Patient/${this.patientId}` },
        effectiveDateTime: new Date(Date.now() - 365 * 2 * 24 * 60 * 60 * 1000).toISOString(),
        dosage: [{
          text: '81mg once daily',
          timing: { repeat: { frequency: 1, period: 1, periodUnit: 'd' } },
          route: {
            coding: [{
              system: 'http://snomed.info/sct',
              code: '26643006',
              display: 'Oral route'
            }]
          },
          doseAndRate: [{
            doseQuantity: { value: 81, unit: 'mg', system: 'http://unitsofmeasure.org', code: 'mg' }
          }]
        }]
      },
      {
        resourceType: 'MedicationStatement',
        id: 'med-atorvastatin',
        status: 'active',
        medicationCodeableConcept: {
          coding: [{
            system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
            code: '617318',
            display: 'Atorvastatin 20 MG Oral Tablet'
          }],
          text: 'Atorvastatin 20mg'
        },
        subject: { reference: `Patient/${this.patientId}` },
        effectiveDateTime: new Date(Date.now() - 365 * 2 * 24 * 60 * 60 * 1000).toISOString(),
        dosage: [{
          text: '20mg once daily at bedtime',
          timing: { repeat: { frequency: 1, period: 1, periodUnit: 'd', when: ['HS'] } },
          route: {
            coding: [{
              system: 'http://snomed.info/sct',
              code: '26643006',
              display: 'Oral route'
            }]
          },
          doseAndRate: [{
            doseQuantity: { value: 20, unit: 'mg', system: 'http://unitsofmeasure.org', code: 'mg' }
          }]
        }]
      },
      {
        resourceType: 'MedicationStatement',
        id: 'med-amoxicillin-discontinued',
        status: 'completed',
        medicationCodeableConcept: {
          coding: [{
            system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
            code: '308192',
            display: 'Amoxicillin 500 MG Oral Capsule'
          }],
          text: 'Amoxicillin 500mg (Discontinued)'
        },
        subject: { reference: `Patient/${this.patientId}` },
        effectivePeriod: {
          start: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
          end: new Date(Date.now() - 110 * 24 * 60 * 60 * 1000).toISOString()
        },
        dosage: [{
          text: '500mg three times daily for 10 days',
          timing: { repeat: { frequency: 3, period: 1, periodUnit: 'd' } },
          route: {
            coding: [{
              system: 'http://snomed.info/sct',
              code: '26643006',
              display: 'Oral route'
            }]
          }
        }]
      }
    ];

    return medications;
  }

  private generateObservations() {
    const observations: any[] = [];

    // Generate vitals over 90 days (weekly readings)
    const vitalsDates: Date[] = [];
    for (let i = 0; i < 13; i++) {
      vitalsDates.push(new Date(this.dateRange.start.getTime() + i * 7 * 24 * 60 * 60 * 1000));
    }

    // Blood Pressure readings
    vitalsDates.forEach((date, i) => {
      const systolic = 115 + Math.floor(this.rng.range(-5, 15));
      const diastolic = 72 + Math.floor(this.rng.range(-5, 10));

      observations.push({
        resourceType: 'Observation',
        id: `obs-bp-${i + 1}`,
        status: 'final',
        category: [{
          coding: [{
            system: 'http://terminology.hl7.org/CodeSystem/observation-category',
            code: 'vital-signs',
            display: 'Vital Signs'
          }]
        }],
        code: {
          coding: [{
            system: 'http://loinc.org',
            code: '85354-9',
            display: 'Blood pressure panel'
          }],
          text: 'Blood Pressure'
        },
        subject: { reference: `Patient/${this.patientId}` },
        effectiveDateTime: date.toISOString(),
        component: [
          {
            code: {
              coding: [{
                system: 'http://loinc.org',
                code: '8480-6',
                display: 'Systolic blood pressure'
              }]
            },
            valueQuantity: {
              value: systolic,
              unit: 'mmHg',
              system: 'http://unitsofmeasure.org',
              code: 'mm[Hg]'
            }
          },
          {
            code: {
              coding: [{
                system: 'http://loinc.org',
                code: '8462-4',
                display: 'Diastolic blood pressure'
              }]
            },
            valueQuantity: {
              value: diastolic,
              unit: 'mmHg',
              system: 'http://unitsofmeasure.org',
              code: 'mm[Hg]'
            }
          }
        ]
      });
    });

    // Heart Rate / Pulse
    vitalsDates.forEach((date, i) => {
      observations.push({
        resourceType: 'Observation',
        id: `obs-pulse-${i + 1}`,
        status: 'final',
        category: [{
          coding: [{
            system: 'http://terminology.hl7.org/CodeSystem/observation-category',
            code: 'vital-signs'
          }]
        }],
        code: {
          coding: [{
            system: 'http://loinc.org',
            code: '8867-4',
            display: 'Heart rate'
          }],
          text: 'Pulse'
        },
        subject: { reference: `Patient/${this.patientId}` },
        effectiveDateTime: date.toISOString(),
        valueQuantity: {
          value: 68 + Math.floor(this.rng.range(-8, 12)),
          unit: '/min',
          system: 'http://unitsofmeasure.org',
          code: '/min'
        }
      });
    });

    // SpO2
    vitalsDates.forEach((date, i) => {
      observations.push({
        resourceType: 'Observation',
        id: `obs-spo2-${i + 1}`,
        status: 'final',
        category: [{
          coding: [{
            system: 'http://terminology.hl7.org/CodeSystem/observation-category',
            code: 'vital-signs'
          }]
        }],
        code: {
          coding: [{
            system: 'http://loinc.org',
            code: '59408-5',
            display: 'Oxygen saturation'
          }],
          text: 'SpO₂'
        },
        subject: { reference: `Patient/${this.patientId}` },
        effectiveDateTime: date.toISOString(),
        valueQuantity: {
          value: 96 + Math.floor(this.rng.range(0, 3)),
          unit: '%',
          system: 'http://unitsofmeasure.org',
          code: '%'
        }
      });
    });

    // Lab results (less frequent - every 30 days)
    const labDates = [
      new Date(this.dateRange.start.getTime()),
      new Date(this.dateRange.start.getTime() + 30 * 24 * 60 * 60 * 1000),
      new Date(this.dateRange.start.getTime() + 60 * 24 * 60 * 60 * 1000)
    ];

    // HbA1c
    labDates.forEach((date, i) => {
      observations.push({
        resourceType: 'Observation',
        id: `obs-hba1c-${i + 1}`,
        status: 'final',
        category: [{
          coding: [{
            system: 'http://terminology.hl7.org/CodeSystem/observation-category',
            code: 'laboratory'
          }]
        }],
        code: {
          coding: [{
            system: 'http://loinc.org',
            code: '4548-4',
            display: 'Hemoglobin A1c'
          }],
          text: 'HbA1c'
        },
        subject: { reference: `Patient/${this.patientId}` },
        effectiveDateTime: date.toISOString(),
        valueQuantity: {
          value: 6.2 + this.rng.range(-0.3, 0.5),
          unit: '%',
          system: 'http://unitsofmeasure.org',
          code: '%'
        }
      });
    });

    // Fasting Glucose
    labDates.forEach((date, i) => {
      observations.push({
        resourceType: 'Observation',
        id: `obs-glucose-${i + 1}`,
        status: 'final',
        category: [{
          coding: [{
            system: 'http://terminology.hl7.org/CodeSystem/observation-category',
            code: 'laboratory'
          }]
        }],
        code: {
          coding: [{
            system: 'http://loinc.org',
            code: '1558-6',
            display: 'Fasting glucose'
          }],
          text: 'Fasting Glucose'
        },
        subject: { reference: `Patient/${this.patientId}` },
        effectiveDateTime: date.toISOString(),
        valueQuantity: {
          value: 105 + Math.floor(this.rng.range(-10, 15)),
          unit: 'mg/dL',
          system: 'http://unitsofmeasure.org',
          code: 'mg/dL'
        }
      });
    });

    // Lipid Panel (most recent)
    const recentLabDate = labDates[labDates.length - 1];
    observations.push(
      {
        resourceType: 'Observation',
        id: 'obs-ldl',
        status: 'final',
        category: [{
          coding: [{
            system: 'http://terminology.hl7.org/CodeSystem/observation-category',
            code: 'laboratory'
          }]
        }],
        code: {
          coding: [{
            system: 'http://loinc.org',
            code: '18262-6',
            display: 'LDL Cholesterol'
          }],
          text: 'LDL Cholesterol'
        },
        subject: { reference: `Patient/${this.patientId}` },
        effectiveDateTime: recentLabDate.toISOString(),
        valueQuantity: {
          value: 95 + Math.floor(this.rng.range(-10, 20)),
          unit: 'mg/dL',
          system: 'http://unitsofmeasure.org',
          code: 'mg/dL'
        }
      },
      {
        resourceType: 'Observation',
        id: 'obs-hdl',
        status: 'final',
        category: [{
          coding: [{
            system: 'http://terminology.hl7.org/CodeSystem/observation-category',
            code: 'laboratory'
          }]
        }],
        code: {
          coding: [{
            system: 'http://loinc.org',
            code: '2085-9',
            display: 'HDL Cholesterol'
          }],
          text: 'HDL Cholesterol'
        },
        subject: { reference: `Patient/${this.patientId}` },
        effectiveDateTime: recentLabDate.toISOString(),
        valueQuantity: {
          value: 48 + Math.floor(this.rng.range(-5, 10)),
          unit: 'mg/dL',
          system: 'http://unitsofmeasure.org',
          code: 'mg/dL'
        }
      },
      {
        resourceType: 'Observation',
        id: 'obs-triglycerides',
        status: 'final',
        category: [{
          coding: [{
            system: 'http://terminology.hl7.org/CodeSystem/observation-category',
            code: 'laboratory'
          }]
        }],
        code: {
          coding: [{
            system: 'http://loinc.org',
            code: '2571-8',
            display: 'Triglycerides'
          }],
          text: 'Triglycerides'
        },
        subject: { reference: `Patient/${this.patientId}` },
        effectiveDateTime: recentLabDate.toISOString(),
        valueQuantity: {
          value: 140 + Math.floor(this.rng.range(-20, 30)),
          unit: 'mg/dL',
          system: 'http://unitsofmeasure.org',
          code: 'mg/dL'
        }
      }
    );

    // Weight & BMI (monthly)
    labDates.forEach((date, i) => {
      const weight = 78 + this.rng.range(-2, 2);
      observations.push(
        {
          resourceType: 'Observation',
          id: `obs-weight-${i + 1}`,
          status: 'final',
          category: [{
            coding: [{
              system: 'http://terminology.hl7.org/CodeSystem/observation-category',
              code: 'vital-signs'
            }]
          }],
          code: {
            coding: [{
              system: 'http://loinc.org',
              code: '29463-7',
              display: 'Body weight'
            }],
            text: 'Weight'
          },
          subject: { reference: `Patient/${this.patientId}` },
          effectiveDateTime: date.toISOString(),
          valueQuantity: {
            value: Math.round(weight * 10) / 10,
            unit: 'kg',
            system: 'http://unitsofmeasure.org',
            code: 'kg'
          }
        },
        {
          resourceType: 'Observation',
          id: `obs-bmi-${i + 1}`,
          status: 'final',
          category: [{
            coding: [{
              system: 'http://terminology.hl7.org/CodeSystem/observation-category',
              code: 'vital-signs'
            }]
          }],
          code: {
            coding: [{
              system: 'http://loinc.org',
              code: '39156-5',
              display: 'Body mass index'
            }],
            text: 'BMI'
          },
          subject: { reference: `Patient/${this.patientId}` },
          effectiveDateTime: date.toISOString(),
          valueQuantity: {
            value: Math.round((weight / (1.75 * 1.75)) * 10) / 10,
            unit: 'kg/m2',
            system: 'http://unitsofmeasure.org',
            code: 'kg/m2'
          }
        }
      );
    });

    // Creatinine & eGFR
    labDates.forEach((date, i) => {
      observations.push(
        {
          resourceType: 'Observation',
          id: `obs-creatinine-${i + 1}`,
          status: 'final',
          category: [{
            coding: [{
              system: 'http://terminology.hl7.org/CodeSystem/observation-category',
              code: 'laboratory'
            }]
          }],
          code: {
            coding: [{
              system: 'http://loinc.org',
              code: '2160-0',
              display: 'Creatinine'
            }],
            text: 'Creatinine'
          },
          subject: { reference: `Patient/${this.patientId}` },
          effectiveDateTime: date.toISOString(),
          valueQuantity: {
            value: 0.9 + this.rng.range(-0.1, 0.2),
            unit: 'mg/dL',
            system: 'http://unitsofmeasure.org',
            code: 'mg/dL'
          }
        },
        {
          resourceType: 'Observation',
          id: `obs-egfr-${i + 1}`,
          status: 'final',
          category: [{
            coding: [{
              system: 'http://terminology.hl7.org/CodeSystem/observation-category',
              code: 'laboratory'
            }]
          }],
          code: {
            coding: [{
              system: 'http://loinc.org',
              code: '33914-3',
              display: 'eGFR'
            }],
            text: 'eGFR'
          },
          subject: { reference: `Patient/${this.patientId}` },
          effectiveDateTime: date.toISOString(),
          valueQuantity: {
            value: 85 + Math.floor(this.rng.range(-5, 10)),
            unit: 'mL/min/1.73m2',
            system: 'http://unitsofmeasure.org',
            code: 'mL/min/{1.73_m2}'
          }
        }
      );
    });

    return observations;
  }

  private generateDiagnosticReports() {
    const reports = [
      {
        resourceType: 'DiagnosticReport',
        id: 'report-lipid-panel',
        status: 'final',
        category: [{
          coding: [{
            system: 'http://terminology.hl7.org/CodeSystem/v2-0074',
            code: 'LAB',
            display: 'Laboratory'
          }]
        }],
        code: {
          coding: [{
            system: 'http://loinc.org',
            code: '57698-3',
            display: 'Lipid panel with direct LDL'
          }],
          text: 'Lipid Panel'
        },
        subject: { reference: `Patient/${this.patientId}` },
        effectiveDateTime: new Date(this.dateRange.end.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        issued: new Date(this.dateRange.end.getTime() - 29 * 24 * 60 * 60 * 1000).toISOString(),
        result: [
          { reference: 'Observation/obs-ldl' },
          { reference: 'Observation/obs-hdl' },
          { reference: 'Observation/obs-triglycerides' }
        ],
        conclusion: 'Lipid levels within acceptable range for patient on statin therapy.'
      },
      {
        resourceType: 'DiagnosticReport',
        id: 'report-diabetes-panel',
        status: 'final',
        category: [{
          coding: [{
            system: 'http://terminology.hl7.org/CodeSystem/v2-0074',
            code: 'LAB'
          }]
        }],
        code: {
          coding: [{
            system: 'http://loinc.org',
            code: '24331-1',
            display: 'Lipid panel'
          }],
          text: 'Diabetes Management Panel'
        },
        subject: { reference: `Patient/${this.patientId}` },
        effectiveDateTime: new Date(this.dateRange.end.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        issued: new Date(this.dateRange.end.getTime() - 29 * 24 * 60 * 60 * 1000).toISOString(),
        result: [
          { reference: 'Observation/obs-hba1c-3' },
          { reference: 'Observation/obs-glucose-3' }
        ],
        conclusion: 'HbA1c shows good glycemic control. Continue current diabetes management plan.'
      },
      {
        resourceType: 'DiagnosticReport',
        id: 'report-metabolic',
        status: 'final',
        category: [{
          coding: [{
            system: 'http://terminology.hl7.org/CodeSystem/v2-0074',
            code: 'LAB'
          }]
        }],
        code: {
          coding: [{
            system: 'http://loinc.org',
            code: '24323-8',
            display: 'Comprehensive metabolic panel'
          }],
          text: 'Metabolic Panel'
        },
        subject: { reference: `Patient/${this.patientId}` },
        effectiveDateTime: new Date(this.dateRange.end.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        issued: new Date(this.dateRange.end.getTime() - 59 * 24 * 60 * 60 * 1000).toISOString(),
        result: [
          { reference: 'Observation/obs-creatinine-2' },
          { reference: 'Observation/obs-egfr-2' },
          { reference: 'Observation/obs-glucose-2' }
        ],
        conclusion: 'Kidney function within normal limits. Electrolytes balanced.'
      }
    ];

    return reports;
  }

  private generateImmunizations() {
    const immunizations = [
      {
        resourceType: 'Immunization',
        id: 'imm-flu',
        status: 'completed',
        vaccineCode: {
          coding: [{
            system: 'http://hl7.org/fhir/sid/cvx',
            code: '141',
            display: 'Influenza, seasonal, injectable'
          }],
          text: 'Influenza Vaccine'
        },
        patient: { reference: `Patient/${this.patientId}` },
        occurrenceDateTime: new Date(this.dateRange.start.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        primarySource: true,
        performer: [{
          actor: { reference: 'Practitioner/prac-jones' }
        }]
      },
      {
        resourceType: 'Immunization',
        id: 'imm-covid',
        status: 'completed',
        vaccineCode: {
          coding: [{
            system: 'http://hl7.org/fhir/sid/cvx',
            code: '213',
            display: 'COVID-19 vaccine'
          }],
          text: 'COVID-19 Booster'
        },
        patient: { reference: `Patient/${this.patientId}` },
        occurrenceDateTime: new Date(this.dateRange.start.getTime() + 45 * 24 * 60 * 60 * 1000).toISOString(),
        primarySource: true,
        performer: [{
          actor: { reference: 'Practitioner/prac-jones' }
        }]
      }
    ];

    return immunizations;
  }

  private generateAllergies() {
    const allergies = [
      {
        resourceType: 'AllergyIntolerance',
        id: 'allergy-penicillin',
        clinicalStatus: {
          coding: [{
            system: 'http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical',
            code: 'active'
          }]
        },
        verificationStatus: {
          coding: [{
            system: 'http://terminology.hl7.org/CodeSystem/allergyintolerance-verification',
            code: 'confirmed'
          }]
        },
        type: 'allergy',
        category: ['medication'],
        criticality: 'high',
        code: {
          coding: [{
            system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
            code: '7980',
            display: 'Penicillin'
          }],
          text: 'Penicillin'
        },
        patient: { reference: `Patient/${this.patientId}` },
        onsetDateTime: new Date(Date.now() - 365 * 20 * 24 * 60 * 60 * 1000).toISOString(),
        reaction: [{
          manifestation: [{
            coding: [{
              system: 'http://snomed.info/sct',
              code: '271807003',
              display: 'Rash'
            }],
            text: 'Skin rash'
          }],
          severity: 'moderate'
        }]
      },
      {
        resourceType: 'AllergyIntolerance',
        id: 'allergy-pollen',
        clinicalStatus: {
          coding: [{
            system: 'http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical',
            code: 'active'
          }]
        },
        verificationStatus: {
          coding: [{
            system: 'http://terminology.hl7.org/CodeSystem/allergyintolerance-verification',
            code: 'confirmed'
          }]
        },
        type: 'allergy',
        category: ['environment'],
        criticality: 'low',
        code: {
          coding: [{
            system: 'http://snomed.info/sct',
            code: '256277009',
            display: 'Grass pollen'
          }],
          text: 'Grass Pollen'
        },
        patient: { reference: `Patient/${this.patientId}` },
        onsetDateTime: new Date(Date.now() - 365 * 15 * 24 * 60 * 60 * 1000).toISOString(),
        reaction: [{
          manifestation: [{
            coding: [{
              system: 'http://snomed.info/sct',
              code: '267036007',
              display: 'Sneezing'
            }],
            text: 'Sneezing and nasal congestion'
          }],
          severity: 'mild'
        }]
      }
    ];

    return allergies;
  }

  private generateCarePlan() {
    return {
      resourceType: 'CarePlan',
      id: 'careplan-diabetes',
      status: 'active',
      intent: 'plan',
      title: 'Diabetes Management Plan',
      description: 'Comprehensive diabetes and hypertension management plan',
      subject: { reference: `Patient/${this.patientId}` },
      period: {
        start: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString()
      },
      category: [{
        coding: [{
          system: 'http://snomed.info/sct',
          code: '698360004',
          display: 'Diabetes self management plan'
        }],
        text: 'Diabetes Management'
      }],
      activity: [
        {
          detail: {
            code: {
              coding: [{
                system: 'http://snomed.info/sct',
                code: '229065009',
                display: 'Exercise therapy'
              }],
              text: 'Regular physical activity'
            },
            status: 'in-progress',
            description: '30 minutes of moderate exercise, 5 days per week'
          }
        },
        {
          detail: {
            code: {
              coding: [{
                system: 'http://snomed.info/sct',
                code: '182777000',
                display: 'Dietary advice'
              }],
              text: 'Dietary management'
            },
            status: 'in-progress',
            description: 'Low-sugar, balanced diet with carbohydrate monitoring'
          }
        },
        {
          detail: {
            code: {
              coding: [{
                system: 'http://snomed.info/sct',
                code: '33747003',
                display: 'Blood glucose monitoring'
              }],
              text: 'Blood glucose monitoring'
            },
            status: 'in-progress',
            description: 'Monitor blood glucose levels daily before breakfast'
          }
        }
      ],
      goal: [
        {
          reference: 'Goal/goal-hba1c'
        },
        {
          reference: 'Goal/goal-bp'
        }
      ]
    };
  }
}

