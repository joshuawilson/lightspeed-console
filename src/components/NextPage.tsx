import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Button, 
  Card, 
  CardBody, 
  CardHeader, 
  CardTitle, 
  Title,
  TreeView,
  TreeViewDataItem,
  Toolbar,
  ToolbarContent,
  ToolbarItem
} from '@patternfly/react-core';
import { FolderPlusIcon } from '@patternfly/react-icons';

import GeneralPage from './GeneralPage';
import Terminal from './Terminal';

import './next-page.css';

type NextPageProps = {
  onLegacyView: () => void;
};

const NextPage: React.FC<NextPageProps> = ({ onLegacyView }) => {
  const { t } = useTranslation('plugin__lightspeed-console-plugin');

  // Initial mock tree data with OpenShift components and visualizations
  const initialTreeData: TreeViewDataItem[] = [
    {
      name: 'Monitoring',
      id: 'monitoring',
      children: [
        { name: 'Alerts Dashboard', id: 'alerts-dashboard' },
        { name: 'Alerts Graph', id: 'alerts-graph' },
        { name: 'Metrics Chart', id: 'metrics-chart' },
        { name: 'Logs Timeline', id: 'logs-timeline' }
      ]
    },
    {
      name: 'Workloads',
      id: 'workloads',
      children: [
        { name: 'Pods Status Chart', id: 'pods-status-chart' },
        { name: 'Pods Performance Graph', id: 'pods-performance-graph' },
        { name: 'Deployments Overview', id: 'deployments-overview' },
        { name: 'Services Network Map', id: 'services-network-map' }
      ]
    },
    {
      name: 'Networking',
      id: 'networking',
      children: [
        { name: 'Routes Traffic Graph', id: 'routes-traffic-graph' },
        { name: 'Network Policies Diagram', id: 'network-policies-diagram' },
        { name: 'Ingress Analytics', id: 'ingress-analytics' }
      ]
    },
    {
      name: 'Storage',
      id: 'storage',
      children: [
        { name: 'PVC Usage Chart', id: 'pvc-usage-chart' },
        { name: 'Storage Classes Overview', id: 'storage-classes-overview' },
        { name: 'Volume Health Dashboard', id: 'volume-health-dashboard' }
      ]
    },
    {
      name: 'Security',
      id: 'security',
      children: [
        { name: 'RBAC Permissions Tree', id: 'rbac-permissions-tree' },
        { name: 'Security Policies Graph', id: 'security-policies-graph' },
        { name: 'Vulnerabilities Report', id: 'vulnerabilities-report' }
      ]
    }
  ];

  const [treeData, setTreeData] = React.useState<TreeViewDataItem[]>(initialTreeData);
  const [activeItems, setActiveItems] = React.useState<TreeViewDataItem[]>([]);

  const addNewFolder = React.useCallback(() => {
    const folderCount = treeData.length + 1;
    const newFolder: TreeViewDataItem = {
      name: `New Folder ${folderCount}`,
      id: `new-folder-${folderCount}`,
      children: []
    };
    setTreeData(prev => [...prev, newFolder]);
  }, [treeData.length]);

  const onSelect = React.useCallback((_event: React.MouseEvent, treeViewItem: TreeViewDataItem) => {
    setActiveItems([treeViewItem]);
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
              <CardTitle>{t('Saved Views')}</CardTitle>
              <Toolbar>
                <ToolbarContent>
                  <ToolbarItem>
                    <Button
                      variant="link"
                      icon={<FolderPlusIcon />}
                      onClick={addNewFolder}
                      size="sm"
                      title={t('Add folder')}
                    >
                      {t('Add Folder')}
                    </Button>
                  </ToolbarItem>
                </ToolbarContent>
              </Toolbar>
            </CardHeader>
            <CardBody>
              <TreeView
                data={treeData}
                activeItems={activeItems}
                onSelect={onSelect}
                hasGuides
              />
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
          <GeneralPage 
            onClose={() => {}} 
            onCollapse={() => {}}
            onExpand={() => {}}
          />
        </div>
      </div>
    </div>
  );
};

export default NextPage;
