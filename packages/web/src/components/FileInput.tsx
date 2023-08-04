import React, {
  ChangeEventHandler,
  MouseEventHandler,
  useCallback,
  useRef,
} from 'react';
import styled from '@emotion/styled';
import { Button, Chip, Typography } from '@mui/material';

const InvisibleInput = styled.input`
  display: none;
`;
const FileChipsContainer = styled.div`
  margin: 8px 0 4px;
`;
const FileChip = styled(Chip)`
  margin-right: 8px;
  margin-bottom: 8px;
`;

export interface FileInputProps {
  files: File[];
  onChange: (files: File[]) => void;
  label?: string;
  multiple?: boolean;
  required?: boolean;
  accept?: string;
  buttonText?: string;
}

export function FileInput({
  files,
  onChange,
  label,
  multiple,
  required,
  accept,
  buttonText = 'Загрузить файл',
}: FileInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const createDeleteFileHandler = useCallback(
    (deletedFile: File) => {
      return () => {
        const updatedFiles = files.filter((file) => file !== deletedFile);
        const dt = new DataTransfer();
        updatedFiles.forEach((file) => dt.items.add(file));
        if (inputRef.current) inputRef.current.files = dt.files;
        onChange(updatedFiles);
      };
    },
    [files, onChange],
  );
  const onInputChange = useCallback<ChangeEventHandler<HTMLInputElement>>(
    (e) => {
      if (e.target.files) onChange(Array.from(e.target.files));
    },
    [onChange],
  );
  const onAddFileButtonClick = useCallback<MouseEventHandler>(() => {
    inputRef.current?.click();
  }, []);

  return (
    <div>
      {label && (
        <Typography>
          {label}
          {required && '*'}
        </Typography>
      )}
      <FileChipsContainer>
        {files.map((file, i) => (
          <FileChip
            label={file.name}
            key={i}
            onDelete={createDeleteFileHandler(file)}
          />
        ))}
      </FileChipsContainer>
      <InvisibleInput
        type="file"
        multiple={multiple}
        accept={accept}
        ref={inputRef}
        onChange={onInputChange}
      />
      <Button variant="outlined" onClick={onAddFileButtonClick}>
        {buttonText}
      </Button>
    </div>
  );
}
