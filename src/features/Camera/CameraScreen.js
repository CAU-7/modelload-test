import React, {useState, useEffect} from 'react';
import {View, Text, Button, StyleSheet} from 'react-native';
import {Camera, useCameraDevices} from 'react-native-vision-camera';

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
          setHasPermission(
            newStatus === 'granted' || newStatus === 'authorized',
          );
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
  //   const device = devices && devices[0];

  //   useEffect(() => {
  //     if (devices) {
  //       console.log('Selected device:', device);
  //     }
  //   }, [devices, device]);

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
      <Camera style={StyleSheet.absoluteFill} device={device} isActive={true} />
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
