import React from 'react';
import styles from './sos.module.css';
import { EmergencySOS } from '../../../components/sos/EmergencySOS';

export const metadata = {
  title: 'Emergency SOS | Health Bridge',
  description: 'Request immediate medical assistance and notify your emergency contacts.',
};

export default function SOSPage() {
  return (
    <>
      <div className={styles.pageContainer}>
        <div className={styles.contentWrapper}>
          <header className={styles.header}>
            <h1 className={styles.title}>
              <span role="img" aria-label="alert">🚨</span> Emergency SOS
            </h1>
            <p className={styles.description}>
              Request immediate medical assistance and notify your emergency contacts.
              This action will broadcast your location and vital information to responders.
            </p>
          </header>
          
          <main>
            <EmergencySOS />
          </main>
        </div>
      </div>
    </>
  );
}
