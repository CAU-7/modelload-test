import tensorflow as tf

# SavedModel 경로 지정
saved_model_dir = r"C:\Users\82104\Downloads\ssd-mobilenet-v2-tensorflow2-fpnlite-320x320-v1" # saved_model.pb파일 경로

# SavedModel을 TFLite 모델로 변환
print("모델 변환 시작...")
converter = tf.lite.TFLiteConverter.from_saved_model(saved_model_dir)

# 최적화 옵션 설정
converter.optimizations = [tf.lite.Optimize.DEFAULT]
converter.target_spec.supported_types = [tf.float16]

# 변환 실행
print("변환 중...")
try:
    tflite_model = converter.convert()
    print("변환 성공!")

    # TFLite 모델 저장
    output_path = 'model.tflite'
    with open(output_path, 'wb') as f:
        f.write(tflite_model)
    print(f"모델이 성공적으로 저장되었습니다: {output_path}")

except Exception as e:
    print(f"변환 중 오류 발생: {str(e)}")