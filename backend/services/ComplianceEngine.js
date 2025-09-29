import fs from 'fs/promises';
import path from 'path';

class ComplianceEngine {
  constructor() {
    this.rules = [];
    this.loadRules();
  }

  async loadRules() {
    try {
      const rulesPath = path.join(process.cwd(), 'rules', 'complianceRules.json');
      const rulesData = await fs.readFile(rulesPath, 'utf8');
      const parsedRules = JSON.parse(rulesData);
      this.rules = parsedRules.rules;
    } catch (error) {
      console.error('Error loading rules:', error);
      this.rules = [];
    }
  }

  validateRule(rule, text) {
    const lowerText = text.toLowerCase();
    
    switch (rule.validation_type) {
      case 'regex_presence':
        const regex = new RegExp(rule.pattern, 'i');
        const match = regex.exec(text);
        return {
          found: match !== null,
          evidence: match ? match[0] : null
        };

      case 'keyword_presence':
        const keywords = rule.keywords || [];
        const foundKeywords = keywords.filter(keyword => 
          lowerText.includes(keyword.toLowerCase())
        );
        return {
          found: foundKeywords.length > 0,
          evidence: foundKeywords.length > 0 ? `Found keywords: ${foundKeywords.join(', ')}` : null
        };

      default:
        return { found: false, evidence: null };
    }
  }

  calculateComplianceScore(rulesResults) {
    const totalRules = rulesResults.length;
    const passedRules = rulesResults.filter(result => result.status === 'PASS').length;
    const criticalRules = rulesResults.filter(result => result.isCritical);
    const passedCriticalRules = criticalRules.filter(result => result.status === 'PASS').length;

    // Weight critical rules higher (70% weight for critical rules, 30% for non-critical)
    const criticalScore = criticalRules.length > 0 ? 
      (passedCriticalRules / criticalRules.length) * 70 : 0;
    const nonCriticalScore = totalRules > criticalRules.length ? 
      ((passedRules - passedCriticalRules) / (totalRules - criticalRules.length)) * 30 : 0;

    return Math.round(criticalScore + nonCriticalScore);
  }

  async validateProduct(extractedText) {
    const rulesResults = [];

    for (const rule of this.rules) {
      const validationResult = this.validateRule(rule, extractedText);
      
      rulesResults.push({
        ruleId: rule.rule_id,
        ruleName: rule.rule_name,
        status: validationResult.found ? 'PASS' : 'FAIL',
        evidence: validationResult.evidence || 'Not found in extracted text',
        description: rule.rule_description,
        isCritical: rule.is_critical
      });
    }

    const score = this.calculateComplianceScore(rulesResults);
    const violations = rulesResults
      .filter(result => result.status === 'FAIL')
      .map(result => result.ruleName);

    let status = 'Compliant';
    if (score < 60) status = 'Non-Compliant';
    else if (score < 80) status = 'Needs Review';

    return {
      score,
      status,
      rules: rulesResults,
      violations
    };
  }
}

export default ComplianceEngine;