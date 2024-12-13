import React, {useState, useEffect} from 'react';
import {View, Text, Button, StyleSheet, Alert, Linking} from 'react-native';
import {
  Camera,
  useCameraDevices,
  useFrameProcessor,
} from 'react-native-vision-camera';
import {Worklets} from 'react-native-worklets-core';

const CameraScreen = ({navigateBack}) => {
  const [hasPermission, setHasPermission] = useState(false);
  const [detectedObjects, setDetectedObjects] = useState([]);
  const frameCount = useRef(0);

  useEffect(() => {
    const checkPermission = async () => {
      try {
        const status = await Camera.getCameraPermissionStatus();

        if (status === 'granted' || status === 'authorized') {
          setHasPermission(true);
        } else {
          const newStatus = await Camera.requestCameraPermission();
          if (newStatus === 'denied' || newStatus === 'restricted') {
            Alert.alert(
              '카메라 권한 필요',
              '카메라 사용을 위해 권한이 필요합니다. 설정에서 권한을 허용해주세요.',
              [
                {
                  text: '취소',
                  style: 'cancel',
                  onPress: () => setHasPermission(false),
                },
                {text: '설정으로 이동', onPress: () => Linking.openSettings()},
              ],
            );
          } else {
            setHasPermission(true);
          }
        }
      } catch (error) {
        console.error('Permission check error:', error);
        setHasPermission(false);
      }
    };

    checkPermission();
  }, []);

  const devices = useCameraDevices();
  const device =
    devices?.find(camera => camera.position === 'back') || devices?.[0];

  // JavaScript 함수 정의 및 Worklets로 래핑
  const processFrameData = timestamp => {
    console.log(`Frame processed at: ${timestamp}`);
  };
  const processFrameDataJS = Worklets.createRunOnJS(processFrameData);

  const frameProcessor = useFrameProcessor(frame => {
    'worklet';
    frame.incrementRefCount(); // 프레임 참조 증가
    try {
      // Worklets에서 래핑된 함수 호출
      processFrameDataJS(frame.timestamp);
    } finally {
      frame.decrementRefCount(); // 참조 감소
    }
  }, []);

  if (!device) {
    return (
      <View style={styles.container}>
        <Text>Loading camera...</Text>
        <Button title="Go Back" onPress={navigateBack} />
      </View>
    );
  }

  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>카메라 권한이 필요합니다.</Text>
        <Button title="Go Back" onPress={navigateBack} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        frameProcessor={frameProcessor} // Frame Processor 추가
        frameProcessorFps={1} // 초당 1 프레임 처리
      />
      <Button title="Go Back" onPress={navigateBack} style={styles.button} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  button: {
    marginBottom: 20,
  },
  text: {
    color: 'white',
    fontSize: 18,
    marginBottom: 20,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  bbox: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: 'red',
  },
  label: {
    color: 'white',
    backgroundColor: 'red',
    paddingHorizontal: 4,
    fontSize: 12,
  },
});

export default CameraScreen;
