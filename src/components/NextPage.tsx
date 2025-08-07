import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Card, CardBody, CardHeader, CardTitle, Title } from '@patternfly/react-core';

import NextPageChat from './NextPageChat';
import Terminal from './Terminal';

import './next-page.css';

type NextPageProps = {
  onLegacyView: () => void;
};

const NextPage: React.FC<NextPageProps> = ({ onLegacyView }) => {
  const { t } = useTranslation('plugin__lightspeed-console-plugin');

  const handleNewChat = React.useCallback(() => {
    // Handle new chat if needed
  }, []);

  // Comprehensive event capture to prevent modal dismissal
  const handleContainerEvent = React.useCallback((e: React.SyntheticEvent) => {
    console.log('NextPage handleContainerEvent:', e.type, e.target);
    e.stopPropagation();
  }, []);

  const handleKeyDownCapture = React.useCallback((e: React.KeyboardEvent) => {
    console.log('NextPage handleKeyDownCapture:', e.key, e.target);
    // Capture all keyboard events and stop them from bubbling
    e.stopPropagation();
    // Don't prevent default for normal typing, but stop propagation
    if (e.key === 'Escape') {
      console.log('Escape key intercepted at NextPage level');
      e.preventDefault();
      e.stopPropagation();
    }
  }, []);

  return (
    <div
      className="ols-plugin__next-page"
      onBlur={handleContainerEvent}
      onClick={handleContainerEvent}
      onFocus={handleContainerEvent}
      onKeyDown={handleKeyDownCapture}
      onKeyPress={handleContainerEvent}
      onKeyUp={handleContainerEvent}
      onMouseDown={handleContainerEvent}
      onMouseUp={handleContainerEvent}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 10000,
      }}
    >
      {/* Top Header */}
      <div className="ols-plugin__next-header">
        <Button onClick={onLegacyView} variant="secondary">
          Legacy
        </Button>
        <Title headingLevel="h1">{t('Red Hat OpenShift Lightspeed - Next')}</Title>
        <div /> {/* Spacer for flexbox */}
      </div>

      <div className="ols-plugin__next-content">
        {/* Left Sidebar */}
        <div className="ols-plugin__next-sidebar">
          <Card>
            <CardHeader>
              <CardTitle>Saved Views</CardTitle>
            </CardHeader>
            <CardBody>
              <div>No saved views yet</div>
            </CardBody>
          </Card>
        </div>

        {/* Main Section */}
        <div className="ols-plugin__next-main">
          <div className="ols-plugin__next-main-content">
            <Card>
              <CardHeader>
                <CardTitle>Main Content Area</CardTitle>
              </CardHeader>
              <CardBody>
                <div>This is where the main content will be displayed</div>
              </CardBody>
            </Card>
          </div>

          {/* Terminal at bottom */}
          <div className="ols-plugin__next-terminal">
            <Terminal />
          </div>
        </div>

        {/* Right Chat Panel */}
        <div className="ols-plugin__next-chat">
          <NextPageChat onNewChat={handleNewChat} />
        </div>
      </div>
    </div>
  );
};

export default NextPage;
