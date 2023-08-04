import React, { ChangeEventHandler, useCallback, Fragment } from 'react';
import styled from '@emotion/styled';
import { Button, Divider, Grid, TextField, Typography } from '@mui/material';
import ClearOutlinedIcon from '@mui/icons-material/ClearOutlined';

const TransporterDivider = styled(Divider)`
  margin-top: 12px;
`;
const TransporterTextFieldsContainer = styled(Grid)`
  margin-top: 4px;
  margin-bottom: 8px;
`;
const TransporterTextField = styled(TextField)`
  width: 100%;
`;
const RemoveTransporterButton = styled.button`
  display: flex;
  flex-wrap: wrap;
  align-content: center;
  justify-content: center;
  width: 60px;
  height: 56px;
  margin: auto;
  border: none;
  outline: none;
  background-color: white;
  box-shadow: none;
  cursor: pointer;

  :hover {
    background-color: white;
  }
  :active {
    box-shadow: none;
    background-color: white;
  }
`;
const AddTransporterButton = styled(Button)`
  margin-top: 8px;
`;

export interface Transporter {
  name: string;
  section: string;
  stationCode: string;
}

export interface TransportersInputProps {
  transporters: Transporter[];
  onChange: (transporters: Transporter[]) => void;
}

export function TransportersInput({
  transporters,
  onChange,
}: TransportersInputProps) {
  const onAddTransporterButtonClick = useCallback(() => {
    onChange([...transporters, { name: '', section: '', stationCode: '' }]);
  }, [transporters, onChange]);
  const createTransporterChangeHandler = useCallback<
    (i: number, key: keyof Transporter) => ChangeEventHandler<HTMLInputElement>
  >(
    (i, key) => {
      return (e) =>
        onChange(
          transporters.map((transporter, j) =>
            i === j ? { ...transporter, [key]: e.target.value } : transporter,
          ),
        );
    },
    [transporters, onChange],
  );
  const createRemoveTransporter = useCallback<(i: number) => () => void>(
    (i) => {
      return () =>
        onChange([...transporters.slice(0, i), ...transporters.slice(i + 1)]);
    },
    [transporters, onChange],
  );

  return (
    <div>
      <Typography>Перевозчики</Typography>
      {transporters.map((transporter, i) => (
        <Fragment key={i}>
          {i > 0 && <TransporterDivider />}
          <TransporterTextFieldsContainer container spacing={1}>
            <Grid item xs={10}>
              <TransporterTextField
                label="Перевозчик"
                value={transporter.name}
                onChange={createTransporterChangeHandler(i, 'name')}
              />
            </Grid>
            <Grid item xs={2}>
              <RemoveTransporterButton onClick={createRemoveTransporter(i)}>
                <ClearOutlinedIcon />
              </RemoveTransporterButton>
            </Grid>
            <Grid item xs={5}>
              <TransporterTextField
                label="Участок"
                value={transporter.section}
                onChange={createTransporterChangeHandler(i, 'section')}
              />
            </Grid>
            <Grid item xs={5}>
              <TransporterTextField
                label="Код станции"
                value={transporter.stationCode}
                onChange={createTransporterChangeHandler(i, 'stationCode')}
              />
            </Grid>
          </TransporterTextFieldsContainer>
        </Fragment>
      ))}
      <AddTransporterButton
        variant="outlined"
        onClick={onAddTransporterButtonClick}
      >
        Добавить перевозчика
      </AddTransporterButton>
    </div>
  );
}
