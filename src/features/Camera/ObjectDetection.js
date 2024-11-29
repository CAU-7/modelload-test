import Tflite from 'react-native-tflite';

const ObjectDetection = {
  isModelLoaded: false,

  async loadModel() {
    if (!this.isModelLoaded) {
      try {
        const modelPath = 'models/model.tflite';
        const labelsPath = 'models/labels.txt';

        await Tflite.loadModel({
          model: modelPath,
          labels: labelsPath,
          numThreads: 4, // 성능 최적화를 위해 스레드 수 설정
          isAsset: true, // assets 폴더에서 모델 로드
        });
        this.isModelLoaded = true;
        console.log('모델 로딩 성공');
      } catch (error) {
        console.error('모델 로딩 실패:', error);
      }
    }
  },

  async detectObjects(frameData) {
    if (!this.isModelLoaded) {
      await this.loadModel();
    }

    try {
      const results = await Tflite.detectObjectOnFrame({
        imageData: frameData.image,
        imageWidth: 320, // MobileNet-SSD 입력 크기
        imageHeight: 320, // MobileNet-SSD 입력 크기
        rotation: frameData.rotation || 0, // 기본적으로 회전 없음
        model: 'SSD', // MobileNet-SSD 모델 사용
        imageMean: 127.5,
        imageStd: 127.5,
        threshold: 0.3, // 신뢰도 임계값
        numResultsPerClass: 3, // 클래스당 최대 결과 수
      });

      return this.processResults(results);
    } catch (error) {
      console.error('객체 감지 실패:', error);
      return [];
    }
  },

  processResults(results) {
    return results.map(detection => ({
      bbox: [
        detection.rect.x,
        detection.rect.y,
        detection.rect.w,
        detection.rect.h,
      ],
      class: detection.detectedClass,
      score: detection.confidenceInClass,
    }));
  },
};

export default ObjectDetection;
