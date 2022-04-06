import React from 'react';
import styles from './index.css';
import { MicroApp } from 'umi';

export default () => (
  <div className={styles.normal}>
    <MicroApp name="SaasCenterApp"></MicroApp>
  </div>
);
