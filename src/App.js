import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { DownloadOutlined } from '@ant-design/icons';
import './App.css';
import { Button } from 'antd';

function App() {
  const [excelData1, setExcelData1] = useState([]);
  const [excelData2, setExcelData2] = useState([]);
  const [resultData, setResultData] = useState([]);

  const handleFileUpload = (e, isExcel1) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      const workbook = XLSX.read(new Uint8Array(event.target.result), { type: 'array' });
      const sheetName = workbook.SheetNames.find(name => name === 'B2B') || workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(sheet);

      if (isExcel1) {
        setExcelData1(data);
      } else {
        setExcelData2(data);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const compareData = () => {
    const results = [];

    excelData2.forEach(row2 => {
      const gstin2 = row2['GSTIN'];
      const invoiceNumber2 = row2['Invoice Number']?.match(/\d+$/)?.[0];
      const taxableValue2 = row2['Taxable Value'];
      const igst2 = row2['Integrated Tax'];

      const match1 = excelData1.find(row1 => row1['GSTIN of Supplier'] === gstin2);
      if (match1) {
        const invoiceNumber1 = match1['Invoice Number']?.match(/\d+$/)?.[0];
        const taxableValue1 = match1['Taxable Value'];
        const igst1 = match1['IGST'];

        let matchStatus = 'Matched';
        let remark = '';

        if (invoiceNumber1 !== invoiceNumber2) {
          matchStatus = 'Invoice Number Mismatch';
        } else if (taxableValue1 !== taxableValue2) {
          matchStatus = 'Taxable Value Mismatch';
        } else if (igst1 !== igst2) {
          matchStatus = 'IGST Mismatch';
        }

        results.push({
          ...row2,
          'Matched/Unmatched': matchStatus,
          Remark: remark
        });
      } else {
        results.push({
          ...row2,
          'Matched/Unmatched': 'GSTIN Mismatch',
          Remark: 'GSTIN not found in Excel 1'
        });
      }
    });

    setResultData(results);
  };

  const downloadExcel = () => {
    const ws = XLSX.utils.json_to_sheet(resultData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Comparison Results');

    XLSX.writeFile(wb, 'ComparisonResults.xlsx');
  };

  return (
    <div className="App">
      <h1>Excel Data Comparison</h1>
      <div className="upload-section">
        <div>
          <label htmlFor="excel1">Upload Excel 1 </label>
          <input type="file" style={{color:'red'}} id="excel1" onChange={(e) => handleFileUpload(e, true)} />
        </div>
        <div>
          <label htmlFor="excel2">Upload Excel 2 </label>
          <input type="file" id="excel2"  style={{color:'red'}} onChange={(e) => handleFileUpload(e, false)} />
        </div>
      </div>
      <div className="buttonContained">
        <Button onClick={compareData} className="compare-button">Compare Data</Button>
       
            <Button onClick={downloadExcel} className="download-button">
              Download <DownloadOutlined />
            </Button>
            {resultData.length > 0 && (
          <>
            <table className="result-table">
              <thead>
                <tr>
                  {Object.keys(resultData[0]).map((key) => (
                    <th key={key}>{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {resultData.map((row, index) => (
                  <tr key={index}>
                    {Object.values(row).map((value, i) => (
                      <td key={i}>{value}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
