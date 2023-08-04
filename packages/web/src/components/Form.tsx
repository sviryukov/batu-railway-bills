import React, { useCallback, useState } from 'react';
import styled from '@emotion/styled';
import { LoadingButton } from '@mui/lab';
import { Card, Typography } from '@mui/material';

import { FileInput } from './FileInput';
import { Transporter, TransportersInput } from './TransportersInput';

const InputContainer = styled.div`
  margin-bottom: 24px;
`;
const SubmitButton = styled(LoadingButton)`
  display: flex;
  margin: auto;
`;
const SuccessMessage = styled(Typography)`
  margin-top: 8px;
  text-align: center;
  font-size: 0.87rem;
  color: rgb(102, 187, 106);
`;
const ErrorMessage = styled(Typography)`
  text-align: center;
  margin-top: 8px;
  font-size: 0.87rem;
  color: rgb(244, 67, 54);
`;

export interface ResponseState {
  status: 'success' | 'loading' | 'error';
  message?: string;
}

export function Form() {
  const [xlsx, setXlsx] = useState<File[]>([]);
  const onXlsxInputChange = useCallback(
    (files: File[]) => setXlsx(files[0] ? [files[0]] : []),
    [],
  );

  const [pdfs, setPdfs] = useState<File[]>([]);
  const onPdfsInputChange = useCallback((files: File[]) => setPdfs(files), []);

  const [transporters, setTransporters] = useState<Transporter[]>([]);
  const onTransportersInputChange = useCallback(
    (transporters: Transporter[]) => {
      console.log(transporters);
      setTransporters(transporters);
    },
    [],
  );

  const [responseState, setResponseState] = useState<ResponseState | null>(
    null,
  );
  const submit = useCallback(async () => {
    const formData = new FormData();
    formData.append('dataXlsx', xlsx[0]);
    pdfs.forEach((file, i) => formData.append(`pdfs[${i}]`, file));
    transporters.forEach(({ name, section, stationCode }, i) => {
      formData.append(`transporters[${i}].name`, name);
      formData.append(`transporters[${i}].section`, section);
      formData.append(`transporters[${i}].stationCode`, stationCode);
    });
    try {
      setResponseState({
        status: 'loading',
      });

      const response = await fetch(
        'http://localhost:3001/createAllContainersPDF',
        {
          body: formData,
          method: 'post',
        },
      );
      const file = await response.blob();

      const anchorElement = document.createElement('a');
      document.body.appendChild(anchorElement);
      anchorElement.style.display = 'none';
      const url = window.URL.createObjectURL(file);
      anchorElement.href = url;
      anchorElement.download = 'result.pdf';
      anchorElement.click();
      window.URL.revokeObjectURL(url);
      anchorElement.remove();

      setResponseState({
        status: 'success',
        message: 'Файл успешно сгенерирован',
      });
    } catch (e: any) {
      setResponseState({
        status: 'error',
        message: e?.message || 'При генерации файла произошла ошибка',
      });
    }
  }, [xlsx, pdfs, transporters]);

  return (
    <Card sx={{ maxWidth: 400, margin: 'auto', padding: '20px' }}>
      <InputContainer>
        <FileInput
          files={xlsx}
          onChange={onXlsxInputChange}
          label="XLSX-файл с данными контейнеров"
          required
          accept=".xlsx"
          buttonText="Загрузить XLSX"
        />
      </InputContainer>
      <InputContainer>
        <FileInput
          files={pdfs}
          onChange={onPdfsInputChange}
          label="PDF-файлы ЖДН"
          multiple
          required
          accept=".pdf"
          buttonText="Загрузить PDF"
        />
      </InputContainer>
      <InputContainer>
        <TransportersInput
          transporters={transporters}
          onChange={onTransportersInputChange}
        />
      </InputContainer>
      <SubmitButton
        variant="contained"
        loading={responseState?.status === 'loading'}
        disabled={!xlsx.length || !pdfs.length}
        onClick={submit}
      >
        Сгенерировать PDF
      </SubmitButton>
      {responseState?.status === 'success' && (
        <SuccessMessage>{responseState.message}</SuccessMessage>
      )}
      {responseState?.status === 'error' && (
        <ErrorMessage>{responseState.message}</ErrorMessage>
      )}
    </Card>
  );
}
