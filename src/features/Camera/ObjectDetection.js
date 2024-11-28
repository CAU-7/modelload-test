// src/features/Camera/ObjectDetection.js
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
          numThreads: 4,
          isAsset: true,
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
        imageWidth: frameData.width,
        imageHeight: frameData.height,
        rotation: frameData.rotation,
        model: 'SSD',
        imageMean: 127.5,
        imageStd: 127.5,
        threshold: 0.3,
        numResultsPerClass: 3,
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
