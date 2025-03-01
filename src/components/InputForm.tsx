import React, { useState, useEffect } from 'react';
import { UserInputs } from '../types';
import { DEFAULT_INPUTS, CONTRIBUTION_LIMITS } from '../utils/constants';
import { Info, Download, Calculator, AlertTriangle } from 'lucide-react';

interface InputFormProps {
  inputs: UserInputs;
  setInputs: React.Dispatch<React.SetStateAction<UserInputs>>;
  onCalculate: () => void;
  onDownload: () => void;
}

const InputForm: React.FC<InputFormProps> = ({ inputs, setInputs, onCalculate, onDownload }) => {
  const [iraError, setIraError] = useState<string | null>(null);
  const [budgetError, setBudgetError] = useState<string | null>(null);

  // Check for IRA contribution limits
  useEffect(() => {
    const totalIraContribution = inputs.rothIraContribution + inputs.traditionalIraContribution;
    const iraLimit = CONTRIBUTION_LIMITS.rothIra;
    
    if (totalIraContribution > iraLimit) {
      setIraError(`Combined IRA contributions exceed the annual limit of $${iraLimit.toLocaleString()}`);
    } else {
      setIraError(null);
    }
  }, [inputs.rothIraContribution, inputs.traditionalIraContribution]);

  // Check if annual salary is sufficient for all contributions and withdrawals
  useEffect(() => {
    // Calculate total annual contributions
    const traditional401kContribution = (inputs.annualSalary * inputs.traditional401kPercentage) / 100;
    const personalSavingsContribution = (inputs.annualSalary * inputs.personalSavingsPercentage) / 100;
    const totalIraContributions = inputs.rothIraContribution + inputs.traditionalIraContribution + inputs.backdoorIraContribution;
    
    // Calculate estimated taxes (simplified)
    const estimatedTaxes = (inputs.annualSalary * inputs.currentMarginalTaxRate) / 100;
    
    // Calculate total outflow
    const totalOutflow = traditional401kContribution + personalSavingsContribution + totalIraContributions + estimatedTaxes;
    
    // Calculate remaining for living expenses
    const remainingForLiving = inputs.annualSalary - totalOutflow;
    
    if (totalOutflow > inputs.annualSalary) {
      setBudgetError(`Your total contributions and estimated taxes ($${Math.round(totalOutflow).toLocaleString()}) exceed your annual salary ($${inputs.annualSalary.toLocaleString()})`);
    } else if (remainingForLiving < inputs.annualSalary * 0.2) { // Warning if less than 20% remains for living expenses
      setBudgetError(`Warning: Only $${Math.round(remainingForLiving).toLocaleString()} (${Math.round(remainingForLiving/inputs.annualSalary*100)}% of salary) remains for living expenses after contributions and estimated taxes`);
    } else {
      setBudgetError(null);
    }
  }, [
    inputs.annualSalary, 
    inputs.traditional401kPercentage, 
    inputs.personalSavingsPercentage,
    inputs.rothIraContribution,
    inputs.traditionalIraContribution,
    inputs.backdoorIraContribution,
    inputs.currentMarginalTaxRate
  ]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // If changing one IRA type, adjust the other to maintain exclusivity
    if (name === 'rothIraContribution' && parseFloat(value) > 0) {
      setInputs(prev => ({
        ...prev,
        [name]: parseFloat(value) || 0,
        traditionalIraContribution: 0 // Zero out Traditional IRA
      }));
    } else if (name === 'traditionalIraContribution' && parseFloat(value) > 0) {
      setInputs(prev => ({
        ...prev,
        [name]: parseFloat(value) || 0,
        rothIraContribution: 0 // Zero out Roth IRA
      }));
    } else {
      setInputs(prev => ({
        ...prev,
        [name]: parseFloat(value) || 0
      }));
    }
  };

  const handleReset = () => {
    setInputs(DEFAULT_INPUTS);
  };

  const handleMax401k = () => {
    // Calculate the percentage needed to max out 401(k)
    const maxPercentage = Math.min(
      (CONTRIBUTION_LIMITS.traditional401k / inputs.annualSalary) * 100,
      100 // Cap at 100%
    );
    
    setInputs(prev => ({
      ...prev,
      traditional401kPercentage: parseFloat(maxPercentage.toFixed(2))
    }));
  };

  const Tooltip = ({ text }: { text: string }) => (
    <div className="group relative inline-block ml-2">
      <Info size={16} className="text-blue-500 cursor-help" />
      <div className="opacity-0 w-64 bg-black text-white text-xs rounded p-2 absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-2 pointer-events-none group-hover:opacity-100 transition-opacity duration-300">
        {text}
        <svg className="absolute text-black h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255">
          <polygon className="fill-current" points="0,0 127.5,127.5 255,0" />
        </svg>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-2 text-gray-800">Financial Inputs</h2>
      
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
        <h3 className="font-bold text-blue-800 mb-2">How This Calculator Works</h3>
        <p className="text-sm text-blue-700 mb-2">
          This retirement calculator projects your investment growth across different account types, considering:
        </p>
        <ul className="list-disc pl-5 text-sm text-blue-700 mb-2">
          <li>Pre-tax vs. post-tax contributions</li>
          <li>Employer matching for 401(k) plans</li>
          <li>Tax implications during withdrawal phase</li>
          <li>Required Minimum Distributions (RMDs) starting at age 72</li>
          <li>Early withdrawal penalties before age 59½</li>
        </ul>
        <p className="text-sm text-blue-700">
          The calculator compounds your investments annually using your specified growth rate, 
          adjusts for inflation, and shows both gross and after-tax values to help you optimize 
          your retirement strategy.
        </p>
      </div>
      
      {budgetError && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex items-start">
            <AlertTriangle size={20} className="text-red-600 mr-2 mt-0.5" />
            <div>
              <h3 className="font-bold text-red-800 mb-1">Budget Warning</h3>
              <p className="text-sm text-red-700">{budgetError}</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Personal Information</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                Current Age
                <Tooltip text="Your current age. This is the starting point for all projections." />
              </label>
              <input
                type="number"
                name="currentAge"
                value={inputs.currentAge}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                Retirement Age
                <Tooltip text="The age at which you plan to retire. After this age, the calculator assumes you'll stop contributing and start withdrawing from your accounts." />
              </label>
              <input
                type="number"
                name="retirementAge"
                value={inputs.retirementAge}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                Life Expectancy
                <Tooltip text="Your estimated life expectancy. The calculator will project your finances until this age." />
              </label>
              <input
                type="number"
                name="lifeExpectancy"
                value={inputs.lifeExpectancy}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <h3 className="text-lg font-semibold mt-6 mb-4 text-gray-700">Income Details</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                Annual Salary ($)
                <Tooltip text="Your current annual salary before taxes. This is used to calculate contribution amounts for accounts based on percentage of salary." />
              </label>
              <input
                type="number"
                name="annualSalary"
                value={inputs.annualSalary}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${budgetError ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {inputs.annualSalary > 0 && (
                <div className="text-xs text-gray-500 mt-1">
                  <div className="flex justify-between">
                    <span>401(k) contribution:</span>
                    <span>${Math.round((inputs.annualSalary * inputs.traditional401kPercentage) / 100).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Personal savings:</span>
                    <span>${Math.round((inputs.annualSalary * inputs.personalSavingsPercentage) / 100).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>IRA contributions:</span>
                    <span>${Math.round(inputs.rothIraContribution + inputs.traditionalIraContribution + inputs.backdoorIraContribution).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Est. taxes (simplified):</span>
                    <span>${Math.round((inputs.annualSalary * inputs.currentMarginalTaxRate) / 100).toLocaleString()}</span>
                  </div>
                  <div className="border-t border-gray-200 mt-1 pt-1 flex justify-between font-medium">
                    <span>Remaining for living:</span>
                    <span className={budgetError ? 'text-red-600' : 'text-green-600'}>
                      ${Math.round(inputs.annualSalary - 
                        ((inputs.annualSalary * inputs.traditional401kPercentage) / 100) - 
                        ((inputs.annualSalary * inputs.personalSavingsPercentage) / 100) - 
                        (inputs.rothIraContribution + inputs.traditionalIraContribution + inputs.backdoorIraContribution) - 
                        ((inputs.annualSalary * inputs.currentMarginalTaxRate) / 100)).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                Salary Growth Rate (%)
                <Tooltip text="The annual percentage increase you expect in your salary. This compounds yearly until retirement." />
              </label>
              <input
                type="number"
                name="salaryGrowthRate"
                value={inputs.salaryGrowthRate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <h3 className="text-lg font-semibold mt-6 mb-4 text-gray-700">Financial Assumptions</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                Stock Market Return (%)
                <Tooltip text="The average annual return you expect from your investments. Historically, the S&P 500 has returned about 7-10% annually before inflation." />
              </label>
              <input
                type="number"
                name="stockMarketReturn"
                value={inputs.stockMarketReturn}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                Inflation Rate (%)
                <Tooltip text="The expected annual inflation rate. This affects the real value of your investments over time. The historical average is around 2-3%." />
              </label>
              <input
                type="number"
                name="inflationRate"
                value={inputs.inflationRate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                Current Marginal Tax Rate (%)
                <Tooltip text="Your current tax rate. This affects the tax benefits of pre-tax contributions to Traditional 401(k) and Traditional IRA accounts." />
              </label>
              <input
                type="number"
                name="currentMarginalTaxRate"
                value={inputs.currentMarginalTaxRate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                Expected Retirement Tax Rate (%)
                <Tooltip text="The tax rate you expect to pay during retirement. This is used to calculate after-tax values of Traditional 401(k) and IRA withdrawals. If you expect to be in a lower tax bracket in retirement, Traditional accounts may be more beneficial." />
              </label>
              <input
                type="number"
                name="retirementTaxRate"
                value={inputs.retirementTaxRate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Investment Allocations</h3>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  401(k) Contribution (% of salary)
                  <Tooltip text="Percentage of your salary contributed to a Traditional 401(k). These contributions are pre-tax, reducing your current taxable income. The 2023 contribution limit is $22,500." />
                </label>
                <button
                  onClick={handleMax401k}
                  className="text-xs bg-green-600 text-white px-2 py-1 rounded flex items-center"
                  title="Max out 401(k) contribution"
                >
                  <Calculator size={12} className="mr-1" />
                  Max Out
                </button>
              </div>
              <input
                type="number"
                name="traditional401kPercentage"
                value={inputs.traditional401kPercentage}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="text-xs text-gray-500 mt-1">
                Annual contribution: ${Math.round((inputs.annualSalary * inputs.traditional401kPercentage) / 100).toLocaleString()}
                {(inputs.annualSalary * inputs.traditional401kPercentage) / 100 > CONTRIBUTION_LIMITS.traditional401k && (
                  <span className="text-red-500 ml-2">
                    Exceeds annual limit of ${CONTRIBUTION_LIMITS.traditional401k.toLocaleString()}
                  </span>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                Employer Match (% of contribution)
                <Tooltip text="The percentage of your 401(k) contribution that your employer matches. For example, if you contribute 6% and your employer matches 50%, they will add an amount equal to 3% of your salary." />
              </label>
              <input
                type="number"
                name="employerMatch401k"
                value={inputs.employerMatch401k}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                Employer Match Limit (% of salary)
                <Tooltip text="The maximum percentage of your salary that your employer will match. For example, if this is 6%, your employer won't match contributions beyond 6% of your salary." />
              </label>
              <input
                type="number"
                name="employerMatchLimit"
                value={inputs.employerMatchLimit}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className={iraError ? "border-red-300 border p-3 rounded-md bg-red-50" : ""}>
              <div className="bg-yellow-50 p-3 rounded-md mb-3">
                <p className="text-xs text-yellow-800 font-medium">
                  Note: You can contribute to either a Roth IRA or a Traditional IRA, but the combined contribution cannot exceed the annual limit of ${CONTRIBUTION_LIMITS.rothIra.toLocaleString()}.
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  Roth IRA Annual Contribution ($)
                  <Tooltip text="Annual contribution to a Roth IRA. Contributions are made with after-tax dollars, but qualified withdrawals in retirement are tax-free. The 2023 contribution limit is $6,500." />
                </label>
                <input
                  type="number"
                  name="rothIraContribution"
                  value={inputs.rothIraContribution}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${inputs.traditionalIraContribution > 0 ? 'border-gray-300 bg-gray-100' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  disabled={inputs.traditionalIraContribution > 0}
                />
              </div>
              
              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  Traditional IRA Annual Contribution ($)
                  <Tooltip text="Annual contribution to a Traditional IRA. Contributions may be tax-deductible depending on your income and other retirement plans. Withdrawals in retirement are taxed as income. The 2023 contribution limit is $6,500." />
                </label>
                <input
                  type="number"
                  name="traditionalIraContribution"
                  value={inputs.traditionalIraContribution}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${inputs.rothIraContribution > 0 ? 'border-gray-300 bg-gray-100' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  disabled={inputs.rothIraContribution > 0}
                />
              </div>
              
              {iraError && (
                <p className="text-red-600 text-xs mt-2">{iraError}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                Backdoor IRA Annual Contribution ($)
                <Tooltip text="Annual contribution to a Backdoor Roth IRA. This strategy allows high-income earners to contribute to a Roth IRA by first contributing to a Traditional IRA and then converting it. Withdrawals in retirement are tax-free." />
              </label>
              <input
                type="number"
                name="backdoorIraContribution"
                value={inputs.backdoorIraContribution}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                Personal Savings (% of salary)
                <Tooltip text="Percentage of your salary saved in taxable accounts like bank savings, CDs, or brokerage accounts. These savings are made with after-tax dollars and may be subject to capital gains tax on investment returns." />
              </label>
              <input
                type="number"
                name="personalSavingsPercentage"
                value={inputs.personalSavingsPercentage}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                Annual Withdrawal in Retirement ($)
                <Tooltip text="The amount you plan to withdraw annually during retirement. The calculator will determine the optimal withdrawal strategy across your accounts to minimize taxes." />
              </label>
              <input
                type="number"
                name="annualWithdrawalAmount"
                value={inputs.annualWithdrawalAmount}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-8 flex justify-end space-x-4">
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
        >
          Reset to Defaults
        </button>
        <button
          onClick={onDownload}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center"
        >
          <Download size={16} className="mr-2" />
          Download Data
        </button>
        <button
          onClick={onCalculate}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          disabled={!!iraError || !!budgetError}
        >
          Calculate Projection
        </button>
      </div>
    </div>
  );
};

export default InputForm;