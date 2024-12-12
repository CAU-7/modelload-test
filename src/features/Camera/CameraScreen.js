import React, {useState, useEffect} from 'react';
import {View, Text, Button, StyleSheet, Alert, Linking} from 'react-native';
import {
  Camera,
  useCameraDevices,
  useFrameProcessor,
} from 'react-native-vision-camera';

const CameraScreen = ({navigateBack}) => {
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    const checkPermission = async () => {
      try {
        const status = await Camera.getCameraPermissionStatus();
        console.log('Camera Permission Status:', status);

        if (status === 'granted' || status === 'authorized') {
          setHasPermission(true);
        } else {
          const newStatus = await Camera.requestCameraPermission();
          console.log('New Camera Permission Status:', newStatus);

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
                {
                  text: '설정으로 이동',
                  onPress: () => Linking.openSettings(),
                },
              ],
            );
          } else {
            setHasPermission(
              newStatus === 'granted' || newStatus === 'authorized',
            );
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

  const frameProcessor = useFrameProcessor(frame => {
    'worklet';
    frame.incrementRefCount(); // 프레임 참조 증가
    try {
      console.log(`Processing frame: ${frame.toString()}`);
      // runOnJS(() => {
      console.log(`Frame timestamp: ${frame.timestamp}`);
      // })();
    } finally {
      frame.decrementRefCount(); // 참조 감소
    }
  }, []);

  if (!device) {
    return (
      <View style={styles.container}>
        <Text>Loading camera...</Text>
        <Button title="Go B ack" onPress={navigateBack} />
      </View>
    );
  }

  if (!hasPermission) {
    console.log('Permission state:', hasPermission);
    return (
      <View style={styles.container}>
        <Text style={styles.text}>카메라 권한이 필요합니다.</Text>
        <Button title="Go Ba ck" onPress={navigateBack} />
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
    justifyContent: 'flex-end',
    alignItems: 'center',
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
});

export default CameraScreen;
