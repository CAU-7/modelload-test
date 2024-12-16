import React, {useState, useEffect} from 'react';
import {View, Text, Button, StyleSheet, Alert, Linking} from 'react-native';
import Tflite from 'react-native-tflite';
import {
  Camera,
  useCameraDevices,
  useFrameProcessor,
} from 'react-native-vision-camera';
import {Worklets} from 'react-native-worklets-core';
import {resize} from 'vision-camera-resize-plugin';

const tflite = new Tflite();

const CameraScreen = ({navigateBack}) => {
  const [hasPermission, setHasPermission] = useState(false);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [result, setResult] = useState(null);

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

    const loadModel = async () => {
      tflite.loadModel(
        {
          model: 'models/model.tflite', // 모델 파일 경로
          labels: 'models/labels.txt', // 라벨 파일 경로
          numThreads: 1, // 사용할 스레드 수
        },
        err => {
          if (err) {
            console.error('TensorFlow Lite 모델 로드 실패:', err);
          } else {
            console.log('TensorFlow Lite 모델 로드 성공');
            setIsModelLoaded(true);
          }
        },
      );
    };
    checkPermission();
    loadModel();
  }, []);

  const devices = useCameraDevices();
  const device =
    devices?.find(camera => camera.position === 'back') || devices?.[0];

  const frameProcessor = useFrameProcessor(frame => {
    'worklet';
    Worklets.createRunOnJS(async frameData => {
      const inputImage = await processFrameToInput(frameData);

      if (!inputImage) {
        console.warn(
          '프레임 처리 중 문제가 발생하여 결과를 생성하지 못했습니다.',
        );
        return;
      }

      tflite.runModelOnImage(
        {
          path: inputImage, // 처리된 이미지 파일 경로
          imageMean: 127.5, // 정규화 값
          imageStd: 127.5, // 정규화 값
          numResults: 3, // 출력할 결과 수
          threshold: 0.5, // 결과 임계값
        },
        (err, res) => {
          if (err) {
            console.error('TensorFlow Lite 추론 실패:', err);
          } else {
            console.log('추론 결과:', res);
            setResult(res);
          }
        },
      );
    })(frame.data);
  }, []);

  const processFrameToInput = async frameData => {
    try {
      const resizedFrame = await resize(frameData, {
        width: 320, // 320x320
        height: 320,
        keepAspectRatio: true,
        format: 'rgba',
      });

      console.log(
        '리사이즈된 프레임 크기:',
        resizedFrame.width,
        resizedFrame.height,
      );

      return resizedFrame.data;
    } catch (error) {
      console.error('프레임 리사이즈 중 오류 발생:', error);
      return null;
    }
  };

  // // JavaScript 함수 정의 및 Worklets로 래핑
  // const processFrameData = timestamp => {
  //   console.log(`Frame processed at: ${timestamp}`);
  // };

  if (!device) {
    return (
      <View style={styles.container}>
        <Text>Loading camera...</Text>
        <Button title="Go Back" onPress={navigateBack} />
      </View>
    );
  }

  if (!hasPermission) {
    console.log('Permission state:', hasPermission);
    return (
      <View style={styles.container}>
        <Text style={styles.text}>카메라 권한이 필요합니다.</Text>
        <Button title="Go Back" onPress={navigateBack} />
      </View>
    );
  }

  if (!isModelLoaded) {
    return (
      <View style={styles.container}>
        <Text>fail to model load...</Text>
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
        frameProcessorFps={15} // 초당 15 프레임 처리
      />
      {result && (
        <View style={styles.resultContainer}>
          <Text style={styles.text}>추론 결과:</Text>
          {result.map((item, index) => (
            <Text key={index} style={styles.text}>
              {item.label}: {item.confidence.toFixed(2)}
            </Text>
          ))}
        </View>
      )}
      <Button title="돌아가기" onPress={navigateBack} style={styles.button} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
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
  resultContainer: {
    position: 'absolute',
    bottom: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 10,
    borderRadius: 8,
  },
});

export default CameraScreen;
