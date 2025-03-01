import React from 'react';
import { INVESTMENT_ACCOUNTS } from '../utils/constants';

const AccountInfo: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Account Types</h2>
      
      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6">
        <h3 className="font-bold text-yellow-800 mb-2">Understanding Tax Treatment</h3>
        <p className="text-sm text-yellow-700 mb-2">
          Different retirement accounts have different tax advantages:
        </p>
        <ul className="list-disc pl-5 text-sm text-yellow-700">
          <li><span className="font-medium">Pre-tax accounts</span> (Traditional 401(k), Traditional IRA): Contributions reduce your current taxable income, but withdrawals are taxed in retirement.</li>
          <li><span className="font-medium">After-tax accounts</span> (Roth IRA, Backdoor IRA): Contributions are made with already-taxed dollars, but qualified withdrawals are tax-free.</li>
          <li><span className="font-medium">Taxable accounts</span> (Personal Savings): Contributions are made with after-tax dollars, and investment gains are subject to capital gains tax.</li>
        </ul>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {INVESTMENT_ACCOUNTS.map(account => (
          <div key={account.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <div 
                className="w-4 h-4 rounded-full mr-2" 
                style={{ backgroundColor: account.color }}
              ></div>
              <h3 className="text-lg font-semibold">{account.name}</h3>
            </div>
            <p className="text-gray-600">{account.description}</p>
          </div>
        ))}
      </div>
      
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-2 text-blue-800">Important Milestones</h3>
        <ul className="list-disc pl-5 space-y-2 text-blue-700">
          <li>
            <span className="font-medium">Age 59½:</span> Penalty-free withdrawals from retirement accounts. Before this age, early withdrawals from 401(k) and Traditional IRA accounts typically incur a 10% penalty in addition to income tax.
          </li>
          <li>
            <span className="font-medium">Age 65:</span> Medicare eligibility. This is an important consideration for healthcare costs in retirement.
          </li>
          <li>
            <span className="font-medium">Age 72:</span> Required Minimum Distributions (RMDs) begin for Traditional IRA and 401(k). The IRS requires you to withdraw a minimum amount annually, calculated based on your account balance and life expectancy.
          </li>
        </ul>
      </div>
      
      <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-2 text-green-800">Calculation Methodology</h3>
        <p className="text-sm text-green-700 mb-2">
          This calculator uses the following approach to project your retirement finances:
        </p>
        <ol className="list-decimal pl-5 space-y-1 text-sm text-green-700">
          <li>During working years (before retirement age):
            <ul className="list-disc pl-5 mt-1">
              <li>Calculates contributions to each account type based on your inputs</li>
              <li>Applies employer match for 401(k) contributions</li>
              <li>Compounds investment growth annually at your specified rate</li>
            </ul>
          </li>
          <li>During retirement years:
            <ul className="list-disc pl-5 mt-1">
              <li>Calculates Required Minimum Distributions (RMDs) for applicable accounts</li>
              <li>Implements a tax-efficient withdrawal strategy (using taxable accounts first, then tax-advantaged accounts)</li>
              <li>Continues to apply investment growth to remaining balances</li>
              <li>Calculates after-tax values based on your expected retirement tax rate</li>
            </ul>
          </li>
        </ol>
      </div>
    </div>
  );
};

export default AccountInfo;