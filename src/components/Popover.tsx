import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Tooltip } from '@patternfly/react-core';
import { consoleFetchJSON } from '@openshift-console/dynamic-plugin-sdk';

import { getRequestInitWithAuthHeader } from '../hooks/useAuth';
import { useBoolean } from '../hooks/useBoolean';
import { useHideLightspeed } from '../hooks/useHideLightspeed';
import { closeOLS, openOLS, setNextView, userFeedbackDisable } from '../redux-actions';
import { State } from '../redux-reducers';
import ErrorBoundary from './ErrorBoundary';
import GeneralPage from './GeneralPage';
import NextPage from './NextPage';

import './popover.css';

// TODO: Include this for now to work around bug where CSS is not pulled in by console plugin SDK
import './pf-styles.css';

const FEEDBACK_STATUS_ENDPOINT =
  '/api/proxy/ols/v1/feedback/status';
const REQUEST_TIMEOUT = 5 * 60 * 1000;

const Popover: React.FC = () => {
  const { t } = useTranslation('plugin__lightspeed-console-plugin');

  const dispatch = useDispatch();

  const isOpen = useSelector((s: State) => s.plugins?.ols?.get('isOpen'));
  const isNextView = useSelector((s: State) => s.plugins?.ols?.get('isNextView'));

  const [isExpanded, , expand, collapse] = useBoolean(false);

  // Debug state changes
  React.useEffect(() => {
    console.log('Popover state changed:', { isOpen, isNextView, isExpanded });
  }, [isOpen, isNextView, isExpanded]);
  const [isHidden] = useHideLightspeed();

  const switchToNextView = React.useCallback(() => {
    dispatch(setNextView(true));
  }, [dispatch]);

  const switchToLegacyView = React.useCallback(() => {
    dispatch(setNextView(false));
  }, [dispatch]);

  // Monitor for unwanted modal closures when in Next view
  React.useEffect(() => {
    if (isNextView && !isOpen) {
      // If we're supposed to be in Next view but modal is closed, reopen it
      console.log('Next view was inappropriately closed, reopening...');
      console.log('Stack trace:', new Error().stack);
      
      // Add a slight delay to prevent rapid reopening loops
      setTimeout(() => {
        dispatch(openOLS());
      }, 100);
    }
  }, [isNextView, isOpen, dispatch]);

  React.useEffect(() => {
    consoleFetchJSON(
      FEEDBACK_STATUS_ENDPOINT,
      'get',
      getRequestInitWithAuthHeader(),
      REQUEST_TIMEOUT,
    )
      .then((response) => {
        if (response.status?.enabled === false) {
          dispatch(userFeedbackDisable());
        }
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error('Error fetching user feedback status:', error);
      });
  }, [dispatch]);

  const open = React.useCallback(() => {
    dispatch(openOLS());
  }, [dispatch]);

  const close = React.useCallback(() => {
    dispatch(closeOLS());
  }, [dispatch]);

  if (isHidden) {
    return null;
  }

  const title = t('Red Hat OpenShift Lightspeed');

  return (
    <div aria-label={title} className="ols-plugin__popover-container">
      {isOpen ? (
        <>
          {isNextView ? (
            <div 
              className="ols-plugin__next-view-container"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  e.stopPropagation();
                }
              }}
            >
              <NextPage onLegacyView={switchToLegacyView} />
            </div>
          ) : (
            <div
              className={`ols-plugin__popover ols-plugin__popover--${
                isExpanded ? 'expanded' : 'collapsed'
              }`}
            >
              {isExpanded ? (
                <GeneralPage onClose={close} onCollapse={collapse} onNextView={switchToNextView} />
              ) : (
                <GeneralPage onClose={close} onExpand={expand} onNextView={switchToNextView} />
              )}
            </div>
          )}
          {!isNextView && (
            <Button
              aria-label={title}
              className="ols-plugin__popover-button"
              onClick={close}
              variant="link"
            />
          )}
        </>
      ) : (
        <Tooltip content={title}>
          <Button
            aria-label={title}
            className="ols-plugin__popover-button"
            onClick={open}
            variant="link"
          />
        </Tooltip>
      )}
    </div>
  );
};

const PopoverWithErrorBoundary: React.FC = () => (
  <ErrorBoundary>
    <Popover />
  </ErrorBoundary>
);

export default PopoverWithErrorBoundary;
