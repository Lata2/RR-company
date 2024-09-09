import React, { useState } from 'react';
import { Upload, Button, message, Table, Typography } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';
import DataComparator from './DataComparator';

const { Title } = Typography;

function UploadForm() {
  const [data1, setData1] = useState(null);
  const [data2, setData2] = useState(null);

  const handleFileUpload = (file, setData) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const workbook = XLSX.read(event.target.result, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      setData(jsonData);
    };
    reader.readAsBinaryString(file);
    return false; // Prevent default upload behavior
  };

  const handleFileChange = (info, setData) => {
    if (info.file.status === 'done') {
      message.success(`${info.file.name} file uploaded successfully.`);
      handleFileUpload(info.file.originFileObj, setData);
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} file upload failed.`);
    }
  };

  return (
    <div>
      <Title level={4}>Upload Excel Files</Title>
      <Upload
        customRequest={(info) => handleFileChange(info, setData1)}
        showUploadList={false}
      >
        <Button icon={<UploadOutlined />}>Upload Excel 1 (2b.xlsx)</Button>
      </Upload>
      <Upload
        customRequest={(info) => handleFileChange(info, setData2)}
        showUploadList={false}
        style={{ marginTop: '16px' }}
      >
        <Button icon={<UploadOutlined />}>Upload Excel 2 (BOOKS MAY (1).xlsx)</Button>
      </Upload>
      {data1 && data2 && (
        <DataComparator data1={data1} data2={data2} />
      )}
    </div>
  );
}

export default UploadForm;
