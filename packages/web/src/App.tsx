import React, { Fragment } from 'react';
import { Helmet } from 'react-helmet';

import { Form } from './components/Form';

const siteTitle = '';

export function App() {
  return (
    <Fragment>
      <Helmet defaultTitle={siteTitle} />
      <Form />
    </Fragment>
  );
}
