import { InvestmentAccount, TaxBracket } from '../types';

export const INVESTMENT_ACCOUNTS: InvestmentAccount[] = [
  {
    id: 'traditional401k',
    name: '401(k)',
    color: '#4299E1',
    description: 'Employer-sponsored retirement account with pre-tax contributions and potential employer matching.'
  },
  {
    id: 'rothIra',
    name: 'Roth IRA',
    color: '#48BB78',
    description: 'Individual retirement account with after-tax contributions and tax-free withdrawals in retirement.'
  },
  {
    id: 'traditionalIra',
    name: 'Traditional IRA',
    color: '#F6AD55',
    description: 'Individual retirement account with pre-tax contributions and taxable withdrawals in retirement.'
  },
  {
    id: 'backdoorIra',
    name: 'Backdoor IRA',
    color: '#9F7AEA',
    description: 'Strategy for high-income earners to contribute to a Roth IRA by first contributing to a Traditional IRA then converting.'
  },
  {
    id: 'personalSavings',
    name: 'Personal Savings',
    color: '#F56565',
    description: 'After-tax savings in bank accounts, CDs, or taxable investment accounts.'
  }
];

export const DEFAULT_INPUTS = {
  currentAge: 30,
  retirementAge: 65,
  lifeExpectancy: 90,
  annualSalary: 75000,
  salaryGrowthRate: 2,
  traditional401kPercentage: 10,
  employerMatch401k: 50,
  employerMatchLimit: 6,
  rothIraContribution: 6000,
  traditionalIraContribution: 0,
  backdoorIraContribution: 0,
  personalSavingsPercentage: 5,
  stockMarketReturn: 7,
  inflationRate: 2,
  currentMarginalTaxRate: 22,
  retirementTaxRate: 15,
  annualWithdrawalAmount: 60000,
  liquidationAge: 45
};

export const CONTRIBUTION_LIMITS = {
  traditional401k: 22500, // 2023 limit
  rothIra: 6500, // 2023 limit
  traditionalIra: 6500, // 2023 limit
  backdoorIra: 6500 // Same as IRA limits
};

export const AGE_MILESTONES = {
  earlyWithdrawalPenaltyEnds: 59.5,
  medicareEligibility: 65,
  rmdStartAge: 72
};

export const EARLY_WITHDRAWAL_PENALTY = 10; // 10% penalty

// Simplified 2023 tax brackets (single filer)
export const TAX_BRACKETS: TaxBracket[] = [
  { rate: 10, minIncome: 0, maxIncome: 11000 },
  { rate: 12, minIncome: 11001, maxIncome: 44725 },
  { rate: 22, minIncome: 44726, maxIncome: 95375 },
  { rate: 24, minIncome: 95376, maxIncome: 182100 },
  { rate: 32, minIncome: 182101, maxIncome: 231250 },
  { rate: 35, minIncome: 231251, maxIncome: 578125 },
  { rate: 37, minIncome: 578126, maxIncome: Infinity }
];