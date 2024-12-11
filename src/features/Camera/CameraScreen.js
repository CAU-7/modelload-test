// import React, {useState, useEffect} from 'react';
// import {View, Text, Button, StyleSheet, Alert, Linking} from 'react-native';
// import {Camera, useCameraDevices} from 'react-native-vision-camera';

// const CameraScreen = ({navigateBack}) => {
//   const [hasPermission, setHasPermission] = useState(false);

//   useEffect(() => {
//     const checkPermission = async () => {
//       try {
//         const status = await Camera.getCameraPermissionStatus();
//         console.log('Camera Permission Status:', status);

//         if (status === 'granted' || status === 'authorized') {
//           setHasPermission(true);
//         } else {
//           const newStatus = await Camera.requestCameraPermission();
//           console.log('New Camera Permission Status:', newStatus);

//           if (newStatus === 'denied' || newStatus === 'restricted') {
//             Alert.alert(
//               '카메라 권한 필요',
//               '카메라 사용을 위해 권한이 필요합니다. 설정에서 권한을 허용해주세요.',
//               [
//                 {
//                   text: '취소',
//                   style: 'cancel',
//                   onPress: () => setHasPermission(false),
//                 },
//                 {
//                   text: '설정으로 이동',
//                   onPress: () => Linking.openSettings(),
//                 },
//               ],
//             );
//           } else {
//             setHasPermission(
//               newStatus === 'granted' || newStatus === 'authorized',
//             );
//           }
//         }
//       } catch (error) {
//         console.error('Permission check error:', error);
//         setHasPermission(false);
//       }
//     };

//     checkPermission();
//   }, []);

//   const devices = useCameraDevices();
//   const device =
//     devices?.find(camera => camera.position === 'back') || devices?.[0];
//   //   const device = devices && devices[0];

//   //   useEffect(() => {
//   //     if (devices) {
//   //       console.log('Selected device:', device);
//   //     }
//   //   }, [devices, device]);

//   if (!device) {
//     return (
//       <View style={styles.container}>
//         <Text>Loading camera...</Text>
//         <Button title="Go B ack" onPress={navigateBack} />
//       </View>
//     );
//   }

//   if (!hasPermission) {
//     console.log('Permission state:', hasPermission);
//     return (
//       <View style={styles.container}>
//         <Text style={styles.text}>카메라 권한이 필요합니다.</Text>
//         <Button title="Go Ba ck" onPress={navigateBack} />
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <Camera style={StyleSheet.absoluteFill} device={device} isActive={true} />
//       <Button title="Go Back" onPress={navigateBack} style={styles.button} />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'flex-end',
//     alignItems: 'center',
//     backgroundColor: '#000',
//   },
//   button: {
//     marginBottom: 20,
//   },
//   text: {
//     color: 'white',
//     fontSize: 18,
//     marginBottom: 20,
//   },
// });

// export default CameraScreen;
import React, {useState, useEffect, useRef} from 'react';
import {View, Text, StyleSheet, Button, Alert, Linking} from 'react-native';
import {
  Camera,
  useCameraDevices,
  useFrameProcessor,
} from 'react-native-vision-camera';
import ObjectDetection from './ObjectDetection';
import {runOnJS} from 'react-native-reanimated';

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

  const frameProcessor = useFrameProcessor(
    frame => {
      'worklet';
      frameCount.current += 1;

      if (frameCount.current % 5 === 0) {
        runOnJS(ObjectDetection.detectObjects)({
          image: frame,
          width: 320, // MobileNet-SSD 입력 크기
          height: 320, // MobileNet-SSD 입력 크기
          rotation: 0,
        })
          .then(results => runOnJS(setDetectedObjects)(results))
          .catch(err => console.error('Detection error:', err));
      }
    },
    [device],
  );

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
        frameProcessor={frameProcessor}
        frameProcessorFps={15}
      />
      <View style={styles.overlay}>
        {detectedObjects.map((obj, index) => (
          <View
            key={index}
            style={[
              styles.bbox,
              {
                left: obj.bbox[0] * (device?.photoWidth / 320 || 1),
                top: obj.bbox[1] * (device?.photoHeight / 320 || 1),
                width: obj.bbox[2] * (device?.photoWidth / 320 || 1),
                height: obj.bbox[3] * (device?.photoHeight / 320 || 1),
              },
            ]}>
            <Text style={styles.label}>
              {obj.class} ({Math.round(obj.score * 100)}%)
            </Text>
          </View>
        ))}
      </View>
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
