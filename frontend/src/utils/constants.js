export const COMPLIANCE_STATUS = {
  COMPLIANT: 'Compliant',
  NON_COMPLIANT: 'Non-Compliant',
  NEEDS_REVIEW: 'Needs Review'
};

export const RULE_STATUS = {
  PASS: 'PASS',
  FAIL: 'FAIL',
  NOT_FOUND: 'NOT_FOUND'
};

export const COMPLIANCE_RULES = [
  {
    id: 'LM_001',
    name: 'MRP Declaration',
    description: 'MRP must be stated and include the phrase "inclusive of all taxes"',
    critical: true
  },
  {
    id: 'LM_002',
    name: 'Net Quantity Declaration',
    description: 'Net quantity must be declared in standard units',
    critical: true
  },
  {
    id: 'LM_003',
    name: 'Country of Origin',
    description: 'Country of Origin must be declared',
    critical: true
  },
  {
    id: 'LM_004',
    name: 'Manufacturer Details',
    description: 'Manufacturer/Packer name and address must be provided',
    critical: false
  },
  {
    id: 'LM_005',
    name: 'Consumer Care Details',
    description: 'Consumer care information must be provided',
    critical: false
  }
];

export const SAMPLE_PRODUCTS = [
  {
    id: 'sample_1',
    title: 'Sample Shampoo 200ml',
    url: 'https://example.com/product1',
    complianceScore: 80,
    status: COMPLIANCE_STATUS.NEEDS_REVIEW
  }
];