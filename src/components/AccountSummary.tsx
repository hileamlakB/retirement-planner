import React, { useState } from 'react';
import { InvestmentData, UserInputs } from '../types';
import { INVESTMENT_ACCOUNTS } from '../utils/constants';
import { calculateAfterTaxValue, calculateLiquidationValueAtAge } from '../utils/calculations';

interface AccountSummaryProps {
  data: InvestmentData[];
  retirementAge: number;
  retirementTaxRate: number;
  liquidationAge: number;
  onLiquidationAgeChange: (age: number) => void;
}

const AccountSummary: React.FC<AccountSummaryProps> = ({ 
  data, 
  retirementAge,
  retirementTaxRate,
  liquidationAge,
  onLiquidationAgeChange
}) => {
  if (!data || data.length === 0) {
    return null;
  }

  // Find data at retirement age
  const retirementData = data.find(d => d.age === retirementAge) || data[0];
  
  // Find data at end of projection
  const finalData = data[data.length - 1];
  
  // Find data at liquidation age
  const liquidationData = data.find(d => d.age === liquidationAge) || retirementData;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };
  
  const handleLiquidationAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAge = parseInt(e.target.value, 10);
    if (!isNaN(newAge) && newAge >= data[0].age && newAge <= data[data.length - 1].age) {
      onLiquidationAgeChange(newAge);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Account Summary</h2>
      
      <div className="mb-6 bg-blue-50 p-4 rounded-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="mb-4 md:mb-0">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">Liquidation Value Calculator</h3>
            <p className="text-sm text-blue-700">
              See how much you would have after taxes and penalties if you liquidated all accounts at a specific age.
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div>
              <label htmlFor="liquidationAge" className="block text-sm font-medium text-blue-700 mb-1">
                Liquidation Age:
              </label>
              <input
                type="number"
                id="liquidationAge"
                value={liquidationAge}
                onChange={handleLiquidationAgeChange}
                min={data[0].age}
                max={data[data.length - 1].age}
                className="w-24 px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="text-center">
              <div className="text-sm font-medium text-blue-700 mb-1">Total Liquidation Value:</div>
              <div className="text-xl font-bold text-blue-900">
                {formatCurrency(liquidationData.liquidationValue || 0)}
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-4 grid grid-cols-1 md:grid-cols-5 gap-3">
          {INVESTMENT_ACCOUNTS.map(account => {
            const accountValue = liquidationData[account.id as keyof InvestmentData] as number;
            const afterTaxValue = calculateAfterTaxValue(
              accountValue, 
              account.id, 
              liquidationAge, 
              retirementTaxRate
            );
            
            return (
              <div key={account.id} className="bg-white p-3 rounded-md shadow-sm">
                <div className="flex items-center mb-1">
                  <div 
                    className="w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: account.color }}
                  ></div>
                  <div className="text-sm font-medium">{account.name}</div>
                </div>
                <div className="text-xs text-gray-500">
                  <div className="flex justify-between">
                    <span>Balance:</span>
                    <span>{formatCurrency(accountValue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>After Tax:</span>
                    <span>{formatCurrency(afterTaxValue)}</span>
                  </div>
                  {account.id === 'traditional401k' || account.id === 'traditionalIra' ? (
                    <div className="flex justify-between text-red-500">
                      <span>Tax + Penalty:</span>
                      <span>-{formatCurrency(accountValue - afterTaxValue)}</span>
                    </div>
                  ) : account.id === 'personalSavings' ? (
                    <div className="flex justify-between text-red-500">
                      <span>Capital Gains Tax:</span>
                      <span>-{formatCurrency(accountValue - afterTaxValue)}</span>
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Account Type
              </th>
              <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                At Retirement (Age {retirementAge})
              </th>
              <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                After-Tax Value
              </th>
              <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                At End of Projection
              </th>
              <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                After-Tax Value
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {INVESTMENT_ACCOUNTS.map((account) => {
              const retirementValue = retirementData[account.id as keyof InvestmentData] as number;
              const finalValue = finalData[account.id as keyof InvestmentData] as number;
              
              const afterTaxRetirementValue = calculateAfterTaxValue(
                retirementValue, 
                account.id, 
                retirementAge, 
                retirementTaxRate
              );
              
              const afterTaxFinalValue = calculateAfterTaxValue(
                finalValue, 
                account.id, 
                finalData.age, 
                retirementTaxRate
              );
              
              return (
                <tr key={account.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2" 
                        style={{ backgroundColor: account.color }}
                      ></div>
                      <div className="text-sm font-medium text-gray-900">
                        {account.name}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                    {formatCurrency(retirementValue)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                    {formatCurrency(afterTaxRetirementValue)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                    {formatCurrency(finalValue)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                    {formatCurrency(afterTaxFinalValue)}
                  </td>
                </tr>
              );
            })}
            
            <tr className="bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                Total
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-900">
                {formatCurrency(retirementData.totalNetWorth)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-900">
                {formatCurrency(retirementData.liquidationValue || 0)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-900">
                {formatCurrency(finalData.totalNetWorth)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-900">
                {formatCurrency(finalData.liquidationValue || 0)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AccountSummary;