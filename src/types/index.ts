export interface InvestmentAccount {
  id: string;
  name: string;
  color: string;
  description: string;
}

export interface UserInputs {
  // Personal Information
  currentAge: number;
  retirementAge: number;
  lifeExpectancy: number;
  
  // Income Details
  annualSalary: number;
  salaryGrowthRate: number;
  
  // Investment Allocations (percentages)
  traditional401kPercentage: number;
  employerMatch401k: number;
  employerMatchLimit: number;
  rothIraContribution: number;
  traditionalIraContribution: number;
  backdoorIraContribution: number;
  personalSavingsPercentage: number;
  
  // Financial Assumptions
  stockMarketReturn: number;
  inflationRate: number;
  currentMarginalTaxRate: number;
  retirementTaxRate: number;
  annualWithdrawalAmount: number;
  
  // Liquidation Age
  liquidationAge: number;
}

export interface InvestmentData {
  age: number;
  traditional401k: number;
  rothIra: number;
  traditionalIra: number;
  backdoorIra: number;
  personalSavings: number;
  totalNetWorth: number;
  liquidationValue?: number;
}

export interface TaxBracket {
  rate: number;
  minIncome: number;
  maxIncome: number;
}