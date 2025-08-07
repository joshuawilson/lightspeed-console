import * as React from 'react';
import {
  Button,
  TextInput,
  Split,
  SplitItem,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
} from '@patternfly/react-core';
import { PlayIcon, TrashIcon } from '@patternfly/react-icons';

import './terminal.css';

type TerminalEntry = {
  id: string;
  command: string;
  output: string;
  timestamp: Date;
  status: 'running' | 'success' | 'error';
};

const Terminal: React.FC = () => {
  const [command, setCommand] = React.useState('');
  const [history, setHistory] = React.useState<TerminalEntry[]>([]);
  const [isRunning, setIsRunning] = React.useState(false);
  const terminalEndRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = React.useCallback(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  React.useEffect(() => {
    scrollToBottom();
  }, [history, scrollToBottom]);

  const executeCommand = React.useCallback(async () => {
    if (!command.trim() || isRunning) return;

    const trimmedCommand = command.trim();
    
    // Validate that command starts with 'oc'
    if (!trimmedCommand.startsWith('oc ')) {
      const errorEntry: TerminalEntry = {
        id: Date.now().toString(),
        command: trimmedCommand,
        output: 'Error: Only "oc" commands are allowed in this terminal.',
        timestamp: new Date(),
        status: 'error',
      };
      setHistory(prev => [...prev, errorEntry]);
      setCommand('');
      return;
    }

    setIsRunning(true);
    
    const newEntry: TerminalEntry = {
      id: Date.now().toString(),
      command: trimmedCommand,
      output: '',
      timestamp: new Date(),
      status: 'running',
    };

    setHistory(prev => [...prev, newEntry]);
    setCommand('');

    try {
      // Simulate command execution with a mock response
      // In a real implementation, this would make an API call to execute the oc command
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      
      let mockOutput = '';
      
      if (trimmedCommand.includes('get pods')) {
        mockOutput = `NAME                                READY   STATUS    RESTARTS   AGE
lightspeed-operator-controller-man  1/1     Running   0          2d
lightspeed-service-api-server       1/1     Running   0          2d
lightspeed-redis                    1/1     Running   0          2d`;
      } else if (trimmedCommand.includes('get nodes')) {
        mockOutput = `NAME                         STATUS   ROLES           AGE   VERSION
master-0.example.com         Ready    control-plane   5d    v1.28.0
master-1.example.com         Ready    control-plane   5d    v1.28.0
master-2.example.com         Ready    control-plane   5d    v1.28.0
worker-0.example.com         Ready    worker          5d    v1.28.0
worker-1.example.com         Ready    worker          5d    v1.28.0`;
      } else if (trimmedCommand.includes('version')) {
        mockOutput = `Client Version: 4.15.0
Kustomize Version: v5.0.4-0.20230601165947-6ce0bf390ce3
Server Version: 4.15.0
Kubernetes Version: v1.28.0+126c5b2`;
      } else if (trimmedCommand.includes('get namespaces')) {
        mockOutput = `NAME                                STATUS   AGE
default                             Active   5d
kube-node-lease                     Active   5d
kube-public                         Active   5d
kube-system                         Active   5d
openshift-lightspeed                Active   2d
openshift-console                   Active   5d
openshift-console-operator          Active   5d`;
      } else {
        mockOutput = `Command executed: ${trimmedCommand}
This is a mock terminal for demonstration purposes.
In a real implementation, this would execute the actual oc command.`;
      }

      setHistory(prev => prev.map(entry => 
        entry.id === newEntry.id 
          ? { ...entry, output: mockOutput, status: 'success' as const }
          : entry
      ));
    } catch (error) {
      setHistory(prev => prev.map(entry => 
        entry.id === newEntry.id 
          ? { ...entry, output: `Error: ${error.message}`, status: 'error' as const }
          : entry
      ));
    } finally {
      setIsRunning(false);
    }
  }, [command, isRunning]);

  const clearHistory = React.useCallback(() => {
    setHistory([]);
  }, []);

  const onKeyPress = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        executeCommand();
      }
    },
    [executeCommand],
  );

  const formatTimestamp = (timestamp: Date): string => {
    return timestamp.toLocaleTimeString();
  };

  return (
    <Card className="ols-plugin__terminal">
      <CardHeader>
        <CardTitle>
          <Split hasGutter>
            <SplitItem>OpenShift Terminal</SplitItem>
            <SplitItem isFilled />
            <SplitItem>
              <Button
                variant="link"
                icon={<TrashIcon />}
                onClick={clearHistory}
                isDisabled={history.length === 0}
                size="sm"
              >
                Clear
              </Button>
            </SplitItem>
          </Split>
        </CardTitle>
      </CardHeader>
      <CardBody className="ols-plugin__terminal-body">
        <div className="ols-plugin__terminal-output">
          {history.map((entry) => (
            <div key={entry.id} className="ols-plugin__terminal-entry">
              <div className="ols-plugin__terminal-command">
                <span className="ols-plugin__terminal-prompt">$ </span>
                <span className="ols-plugin__terminal-command-text">{entry.command}</span>
                <span className="ols-plugin__terminal-timestamp">
                  [{formatTimestamp(entry.timestamp)}]
                </span>
              </div>
              {entry.output && (
                <div className={`ols-plugin__terminal-output-text ols-plugin__terminal-output--${entry.status}`}>
                  {entry.output}
                </div>
              )}
              {entry.status === 'running' && (
                <div className="ols-plugin__terminal-output-text">
                  <div className="ols-plugin__terminal-spinner">Running...</div>
                </div>
              )}
            </div>
          ))}
          <div ref={terminalEndRef} />
        </div>
        
        <div className="ols-plugin__terminal-input">
          <Split hasGutter>
            <SplitItem>
              <span className="ols-plugin__terminal-prompt">$ </span>
            </SplitItem>
            <SplitItem isFilled>
              <TextInput
                value={command}
                onChange={(_event, value) => setCommand(value)}
                onKeyDown={onKeyPress}
                placeholder="Enter oc command..."
                isDisabled={isRunning}
                className="ols-plugin__terminal-input-field"
              />
            </SplitItem>
            <SplitItem>
              <Button
                variant="primary"
                icon={<PlayIcon />}
                onClick={executeCommand}
                isDisabled={!command.trim() || isRunning}
                size="sm"
              >
                Run
              </Button>
            </SplitItem>
          </Split>
        </div>
      </CardBody>
    </Card>
  );
};

export default Terminal;