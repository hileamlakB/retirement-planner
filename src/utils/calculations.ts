import { UserInputs, InvestmentData, TaxBracket } from '../types';
import { CONTRIBUTION_LIMITS, AGE_MILESTONES, EARLY_WITHDRAWAL_PENALTY, TAX_BRACKETS, INVESTMENT_ACCOUNTS } from './constants';

/**
 * Financial Planner Calculation Logic
 * 
 * This module contains the core calculation functions for the retirement investment calculator.
 * It projects investment growth across different account types, considering:
 * 
 * 1. Account-specific tax treatments:
 *    - Traditional 401(k) & IRA: Pre-tax contributions, taxable withdrawals
 *    - Roth IRA & Backdoor IRA: After-tax contributions, tax-free withdrawals
 *    - Personal Savings: After-tax contributions, capital gains tax on growth
 * 
 * 2. Age-based rules:
 *    - Early withdrawal penalties before age 59½
 *    - Required Minimum Distributions (RMDs) starting at age 72
 * 
 * 3. Contribution limits and employer matching
 * 
 * 4. Tax-efficient withdrawal strategy during retirement
 * 
 * The main function, calculateInvestmentProjection(), simulates year-by-year account
 * growth from current age to life expectancy, with two distinct phases:
 *    - Accumulation phase (working years): Adding contributions and growth
 *    - Withdrawal phase (retirement): Implementing withdrawal strategy and RMDs
 */

// Calculate tax based on income and tax brackets
export function calculateTax(income: number, taxBrackets: TaxBracket[]): number {
  let tax = 0;
  let remainingIncome = income;

  for (const bracket of taxBrackets) {
    if (remainingIncome <= 0) break;
    
    const taxableAmountInBracket = Math.min(
      remainingIncome,
      bracket.maxIncome - bracket.minIncome + 1
    );
    
    tax += (taxableAmountInBracket * bracket.rate) / 100;
    remainingIncome -= taxableAmountInBracket;
  }

  return tax;
}

// Calculate Required Minimum Distribution (RMD)
export function calculateRMD(age: number, accountBalance: number): number {
  if (age < AGE_MILESTONES.rmdStartAge) return 0;
  
  // Simplified RMD calculation (actual calculation uses life expectancy tables)
  const lifeExpectancy = 90 - age;
  return accountBalance / lifeExpectancy;
}

// Calculate annual investment growth
function calculateGrowth(amount: number, rate: number): number {
  return amount * (1 + rate / 100);
}

// Calculate employer match for 401(k)
function calculateEmployerMatch(
  salary: number,
  contributionPercentage: number,
  matchPercentage: number,
  matchLimit: number
): number {
  // Employee contribution as a percentage of salary
  const employeeContribution = (salary * contributionPercentage) / 100;
  
  // Potential match based on match percentage
  const potentialMatch = employeeContribution * (matchPercentage / 100);
  
  // Maximum match based on employer's limit
  const maxMatch = (salary * matchLimit) / 100;
  
  // Return the lesser of potential match and max match
  return Math.min(potentialMatch, maxMatch);
}

// Main calculation function to project investments over time
export function calculateInvestmentProjection(inputs: UserInputs): InvestmentData[] {
  const projectionData: InvestmentData[] = [];
  
  // Initialize account balances
  let traditional401kBalance = 0;
  let rothIraBalance = 0;
  let traditionalIraBalance = 0;
  let backdoorIraBalance = 0;
  let personalSavingsBalance = 0;
  
  let currentSalary = inputs.annualSalary;
  
  // Accumulation phase (working years)
  for (let age = inputs.currentAge; age <= inputs.lifeExpectancy; age++) {
    // Update salary with growth rate
    if (age < inputs.retirementAge) {
      currentSalary = age > inputs.currentAge 
        ? currentSalary * (1 + inputs.salaryGrowthRate / 100) 
        : currentSalary;
    }
    
    // Calculate contributions during working years
    if (age < inputs.retirementAge) {
      // 401(k) contribution and employer match
      const contribution401k = Math.min(
        (currentSalary * inputs.traditional401kPercentage) / 100,
        CONTRIBUTION_LIMITS.traditional401k
      );
      
      const employerMatch = calculateEmployerMatch(
        currentSalary,
        inputs.traditional401kPercentage,
        inputs.employerMatch401k,
        inputs.employerMatchLimit
      );
      
      traditional401kBalance += contribution401k + employerMatch;
      
      // IRA contributions
      rothIraBalance += Math.min(inputs.rothIraContribution, CONTRIBUTION_LIMITS.rothIra);
      traditionalIraBalance += Math.min(inputs.traditionalIraContribution, CONTRIBUTION_LIMITS.traditionalIra);
      backdoorIraBalance += Math.min(inputs.backdoorIraContribution, CONTRIBUTION_LIMITS.backdoorIra);
      
      // Personal savings
      const personalSavingsContribution = (currentSalary * inputs.personalSavingsPercentage) / 100;
      personalSavingsBalance += personalSavingsContribution;
    } 
    // Withdrawal phase (retirement)
    else {
      // Calculate RMDs for traditional accounts
      const rmd401k = calculateRMD(age, traditional401kBalance);
      const rmdTraditionalIra = calculateRMD(age, traditionalIraBalance);
      
      // Determine withdrawal strategy (simplified)
      let remainingWithdrawal = inputs.annualWithdrawalAmount;
      
      // First use RMDs (required)
      if (rmd401k > 0) {
        traditional401kBalance -= rmd401k;
        remainingWithdrawal -= rmd401k;
      }
      
      if (rmdTraditionalIra > 0) {
        traditionalIraBalance -= rmdTraditionalIra;
        remainingWithdrawal -= rmdTraditionalIra;
      }
      
      // Then use personal savings (most tax efficient)
      if (remainingWithdrawal > 0 && personalSavingsBalance > 0) {
        const personalSavingsWithdrawal = Math.min(remainingWithdrawal, personalSavingsBalance);
        personalSavingsBalance -= personalSavingsWithdrawal;
        remainingWithdrawal -= personalSavingsWithdrawal;
      }
      
      // Then use Roth accounts (tax-free)
      if (remainingWithdrawal > 0 && rothIraBalance > 0) {
        const rothWithdrawal = Math.min(remainingWithdrawal, rothIraBalance);
        rothIraBalance -= rothWithdrawal;
        remainingWithdrawal -= rothWithdrawal;
      }
      
      if (remainingWithdrawal > 0 && backdoorIraBalance > 0) {
        const backdoorWithdrawal = Math.min(remainingWithdrawal, backdoorIraBalance);
        backdoorIraBalance -= backdoorWithdrawal;
        remainingWithdrawal -= backdoorWithdrawal;
      }
      
      // Then use traditional accounts (taxable)
      if (remainingWithdrawal > 0 && traditional401kBalance > 0) {
        const traditional401kWithdrawal = Math.min(remainingWithdrawal, traditional401kBalance);
        traditional401kBalance -= traditional401kWithdrawal;
        remainingWithdrawal -= traditional401kWithdrawal;
      }
      
      if (remainingWithdrawal > 0 && traditionalIraBalance > 0) {
        const traditionalIraWithdrawal = Math.min(remainingWithdrawal, traditionalIraBalance);
        traditionalIraBalance -= traditionalIraWithdrawal;
        remainingWithdrawal -= traditionalIraWithdrawal;
      }
    }
    
    // Apply investment growth to all accounts
    traditional401kBalance = calculateGrowth(traditional401kBalance, inputs.stockMarketReturn);
    rothIraBalance = calculateGrowth(rothIraBalance, inputs.stockMarketReturn);
    traditionalIraBalance = calculateGrowth(traditionalIraBalance, inputs.stockMarketReturn);
    backdoorIraBalance = calculateGrowth(backdoorIraBalance, inputs.stockMarketReturn);
    personalSavingsBalance = calculateGrowth(personalSavingsBalance, inputs.stockMarketReturn * 0.7); // Lower return for personal savings
    
    // Calculate total net worth
    const totalNetWorth = 
      traditional401kBalance + 
      rothIraBalance + 
      traditionalIraBalance + 
      backdoorIraBalance + 
      personalSavingsBalance;
    
    // Calculate liquidation value (after taxes and penalties)
    const liquidationValue = calculateLiquidationValue({
      traditional401k: traditional401kBalance,
      rothIra: rothIraBalance,
      traditionalIra: traditionalIraBalance,
      backdoorIra: backdoorIraBalance,
      personalSavings: personalSavingsBalance
    }, age, inputs.retirementTaxRate);
    
    // Add data point for this year
    projectionData.push({
      age,
      traditional401k: Math.round(traditional401kBalance),
      rothIra: Math.round(rothIraBalance),
      traditionalIra: Math.round(traditionalIraBalance),
      backdoorIra: Math.round(backdoorIraBalance),
      personalSavings: Math.round(personalSavingsBalance),
      totalNetWorth: Math.round(totalNetWorth),
      liquidationValue: Math.round(liquidationValue)
    });
  }
  
  return projectionData;
}

// Calculate after-tax value of accounts
export function calculateAfterTaxValue(
  accountValue: number, 
  accountType: string, 
  age: number, 
  taxRate: number
): number {
  if (accountType === 'rothIra' || accountType === 'backdoorIra') {
    // Roth accounts are tax-free in retirement
    return accountValue;
  } else if ((accountType === 'traditional401k' || accountType === 'traditionalIra') && age < AGE_MILESTONES.earlyWithdrawalPenaltyEnds) {
    // Early withdrawal penalty + taxes
    return accountValue * (1 - (taxRate / 100) - (EARLY_WITHDRAWAL_PENALTY / 100));
  } else if (accountType === 'traditional401k' || accountType === 'traditionalIra') {
    // Regular tax in retirement
    return accountValue * (1 - (taxRate / 100));
  } else {
    // Personal savings - only capital gains are taxed (simplified)
    // Assumes 30% of the balance is taxable gains
    return accountValue * (1 - ((taxRate / 100) * 0.3));
  }
}

// Calculate total liquidation value after taxes and penalties
export function calculateLiquidationValue(
  accounts: {
    traditional401k: number;
    rothIra: number;
    traditionalIra: number;
    backdoorIra: number;
    personalSavings: number;
  },
  age: number,
  taxRate: number
): number {
  let totalLiquidationValue = 0;
  
  // Calculate after-tax value for each account
  for (const account of INVESTMENT_ACCOUNTS) {
    const accountValue = accounts[account.id as keyof typeof accounts];
    const afterTaxValue = calculateAfterTaxValue(accountValue, account.id, age, taxRate);
    totalLiquidationValue += afterTaxValue;
  }
  
  return totalLiquidationValue;
}

// Calculate liquidation value at a specific age
export function calculateLiquidationValueAtAge(
  data: InvestmentData[],
  age: number,
  taxRate: number
): number | null {
  const dataPoint = data.find(d => d.age === age);
  if (!dataPoint) return null;
  
  return calculateLiquidationValue({
    traditional401k: dataPoint.traditional401k,
    rothIra: dataPoint.rothIra,
    traditionalIra: dataPoint.traditionalIra,
    backdoorIra: dataPoint.backdoorIra,
    personalSavings: dataPoint.personalSavings
  }, age, taxRate);
}