import React, { Fragment } from 'react';
import { Helmet } from 'react-helmet';

const siteTitle = '';

export function App() {
  return (
    <Fragment>
      <Helmet defaultTitle={siteTitle} />
    </Fragment>
  );
}
