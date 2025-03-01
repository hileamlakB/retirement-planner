import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import InputForm from './components/InputForm';
import InvestmentChart from './components/InvestmentChart';
import AccountSummary from './components/AccountSummary';
import AccountInfo from './components/AccountInfo';
import { UserInputs, InvestmentData } from './types';
import { DEFAULT_INPUTS } from './utils/constants';
import { calculateInvestmentProjection } from './utils/calculations';
import { exportToExcel, downloadChartAsImage } from './utils/exportUtils';

function App() {
  const [inputs, setInputs] = useState<UserInputs>(DEFAULT_INPUTS);
  const [projectionData, setProjectionData] = useState<InvestmentData[]>([]);
  const [isCalculated, setIsCalculated] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);

  // Calculate initial projection on first render
  useEffect(() => {
    handleCalculate();
  }, []);

  const handleCalculate = () => {
    const data = calculateInvestmentProjection(inputs);
    setProjectionData(data);
    setIsCalculated(true);
  };

  const handleDownloadData = () => {
    if (projectionData.length > 0) {
      exportToExcel(projectionData, inputs, 'retirement-projection-data.xlsx');
    }
  };

  const handleDownloadChart = () => {
    if (chartRef.current) {
      downloadChartAsImage(chartRef.current, 'retirement-projection-chart.png');
    }
  };
  
  const handleLiquidationAgeChange = (age: number) => {
    setInputs(prev => ({
      ...prev,
      liquidationAge: age
    }));
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Retirement Investment Calculator</h2>
          <p className="text-gray-600">
            This tool helps you compare different retirement investment strategies by projecting the growth of various account types over time.
            It factors in tax implications, employer contributions, withdrawal strategies, and important age milestones to give you a comprehensive
            view of your potential retirement finances.
          </p>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <h3 className="font-semibold text-blue-800">Pre-Tax vs. After-Tax</h3>
              <p className="text-sm text-blue-700">Compare the benefits of Traditional (pre-tax) and Roth (after-tax) retirement accounts based on your current and expected future tax rates.</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <h3 className="font-semibold text-green-800">Employer Match Benefits</h3>
              <p className="text-sm text-green-700">See how employer matching contributions to your 401(k) can significantly boost your retirement savings over time.</p>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <h3 className="font-semibold text-purple-800">Tax-Efficient Withdrawals</h3>
              <p className="text-sm text-purple-700">Understand how a strategic withdrawal approach across different account types can minimize taxes in retirement.</p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-8">
          <InputForm 
            inputs={inputs} 
            setInputs={setInputs} 
            onCalculate={handleCalculate}
            onDownload={handleDownloadData}
          />
          
          {isCalculated && (
            <>
              <div ref={chartRef}>
                <InvestmentChart 
                  data={projectionData} 
                  retirementTaxRate={inputs.retirementTaxRate}
                  onDownloadChart={handleDownloadChart}
                />
              </div>
              
              <AccountSummary 
                data={projectionData} 
                retirementAge={inputs.retirementAge}
                retirementTaxRate={inputs.retirementTaxRate}
                liquidationAge={inputs.liquidationAge}
                onLiquidationAgeChange={handleLiquidationAgeChange}
              />
              
              <AccountInfo />
            </>
          )}
        </div>
      </main>
      
      <footer className="bg-gray-800 text-white py-6 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p>Financial Planner &copy; {new Date().getFullYear()}</p>
          <p className="text-gray-400 text-sm mt-2">
            This tool is for educational purposes only. Consult with a financial advisor for personalized advice.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;