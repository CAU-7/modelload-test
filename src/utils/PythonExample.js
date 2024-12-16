import React from 'react';
import {View, Text, Button} from 'react-native';
const {execFile} = require('child_process');

// 이부분 portable함
const PythonExecute = ({scriptPath, args = [], onSuccess, onError}) => {
  const executePythonScript = () => {
    execFile('python', [scriptPath, ...args], (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${error.message}`);
        if (onError) {
          onError(error);
        }
        return;
      } else if (stderr) {
        console.error(`Stderr: ${stderr}`);
        if (onError) {
          onError(stderr);
        }
        return;
      }
      console.log(`Python Output: ${stdout}`);
      if (onSuccess) {
        onSuccess(stdout);
      }
    });
  };

  return (
    <View>
      <Button title="Execute Python Script" onPress={executePythonScript} />
    </View>
  );
};

const App = () => {
  const handleSuccess = output => {
    console.log('Python script executed successfully:', output);
  };

  const handleError = error => {
    console.error('Error occurred while executing Python script:', error);
  };

  return (
    <View>
      <Text>React Native에서 Python 실행</Text>
      <PythonExecute
        scriptPath="./src/utils/script.py"
        args={['React Native']}
        onSuccess={handleSuccess}
        onError={handleError}
      />
    </View>
  );
};

export default App;
