import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { InvestmentData, UserInputs } from '../types';
import { INVESTMENT_ACCOUNTS } from './constants';
import { calculateAfterTaxValue } from './calculations';

/**
 * Exports investment projection data to an Excel file
 */
export function exportToExcel(
  data: InvestmentData[], 
  inputs: UserInputs, 
  filename: string
): void {
  // Create workbook and worksheets
  const wb = XLSX.utils.book_new();
  
  // Create projection data worksheet
  const projectionWorksheet = createProjectionWorksheet(data, inputs.retirementTaxRate);
  XLSX.utils.book_append_sheet(wb, projectionWorksheet, 'Projection Data');
  
  // Create inputs worksheet
  const inputsWorksheet = createInputsWorksheet(inputs);
  XLSX.utils.book_append_sheet(wb, inputsWorksheet, 'Your Inputs');
  
  // Generate Excel file
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
  // Save file
  saveAs(blob, filename);
}

/**
 * Creates a worksheet with projection data
 */
function createProjectionWorksheet(
  data: InvestmentData[], 
  retirementTaxRate: number
): XLSX.WorkSheet {
  // Create headers
  const headers = [
    'Age', 
    ...INVESTMENT_ACCOUNTS.map(account => account.name),
    'Total Net Worth',
    'Liquidation Value (After Taxes & Penalties)',
    ...INVESTMENT_ACCOUNTS.map(account => `${account.name} (After Tax)`),
    'Total After-Tax Value'
  ];
  
  // Create rows
  const rows = data.map(item => {
    const afterTaxValues = INVESTMENT_ACCOUNTS.map(account => 
      calculateAfterTaxValue(
        item[account.id as keyof InvestmentData] as number, 
        account.id, 
        item.age, 
        retirementTaxRate
      )
    );
    
    const totalAfterTax = afterTaxValues.reduce((sum, value) => sum + value, 0);
    
    return [
      item.age,
      ...INVESTMENT_ACCOUNTS.map(account => item[account.id as keyof InvestmentData]),
      item.totalNetWorth,
      item.liquidationValue || 0,
      ...afterTaxValues,
      totalAfterTax
    ];
  });
  
  // Combine headers and rows
  const wsData = [headers, ...rows];
  
  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  
  // Set column widths
  const colWidths = headers.map(() => ({ wch: 15 }));
  ws['!cols'] = colWidths;
  
  return ws;
}

/**
 * Creates a worksheet with user inputs
 */
function createInputsWorksheet(inputs: UserInputs): XLSX.WorkSheet {
  // Format inputs for display
  const inputsData = [
    ['Parameter', 'Value'],
    ['Current Age', inputs.currentAge],
    ['Retirement Age', inputs.retirementAge],
    ['Life Expectancy', inputs.lifeExpectancy],
    ['Liquidation Age', inputs.liquidationAge],
    ['Annual Salary ($)', inputs.annualSalary],
    ['Salary Growth Rate (%)', inputs.salaryGrowthRate],
    ['401(k) Contribution (% of salary)', inputs.traditional401kPercentage],
    ['Employer Match (%)', inputs.employerMatch401k],
    ['Employer Match Limit (% of salary)', inputs.employerMatchLimit],
    ['Roth IRA Contribution ($)', inputs.rothIraContribution],
    ['Traditional IRA Contribution ($)', inputs.traditionalIraContribution],
    ['Backdoor IRA Contribution ($)', inputs.backdoorIraContribution],
    ['Personal Savings (% of salary)', inputs.personalSavingsPercentage],
    ['Stock Market Return (%)', inputs.stockMarketReturn],
    ['Inflation Rate (%)', inputs.inflationRate],
    ['Current Marginal Tax Rate (%)', inputs.currentMarginalTaxRate],
    ['Expected Retirement Tax Rate (%)', inputs.retirementTaxRate],
    ['Annual Withdrawal in Retirement ($)', inputs.annualWithdrawalAmount]
  ];
  
  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet(inputsData);
  
  // Set column widths
  ws['!cols'] = [{ wch: 30 }, { wch: 15 }];
  
  return ws;
}

/**
 * Downloads the chart as an image
 */
export function downloadChartAsImage(element: HTMLElement, filename: string): void {
  try {
    // Use html2canvas to capture the chart (dynamically import to reduce bundle size)
    import('html2canvas').then(html2canvasModule => {
      const html2canvas = html2canvasModule.default;
      
      html2canvas(element, {
        scale: 2, // Higher resolution
        backgroundColor: '#ffffff',
        logging: false
       }).then(canvas => {
        // Convert canvas to blob
        canvas.toBlob(blob => {
          if (blob) {
            saveAs(blob, filename);
          }
        });
      });
    });
  } catch (error) {
    console.error('Failed to download chart:', error);
    alert('Failed to download chart. Please try again.');
  }
}