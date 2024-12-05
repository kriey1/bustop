from flask import Flask, request, jsonify
from flask_cors import CORS
import whisper
import os

app = Flask(__name__)
CORS(app)

# Whisper 모델 로드
try:
    print("Whisper 모델 로드 중...")
    model = whisper.load_model("base")
    print("Whisper 모델이 성공적으로 로드되었습니다.")
except Exception as e:
    print(f"Whisper 모델 로드 실패: {str(e)}")
    model = None


@app.route("/transcribe", methods=["POST"])
def transcribe_audio():
    if model is None:
        return jsonify({"error": "Whisper 모델이 로드되지 않았습니다."}), 500

    try:
        # 클라이언트에서 보낸 파일
        if "audio" not in request.files:
            return jsonify({"error": "오디오 파일이 전송되지 않았습니다."}), 400

        file = request.files["audio"]
        if not file.filename.endswith(".wav"):
            return jsonify({"error": "지원되지 않는 파일 형식입니다. WAV 파일만 허용됩니다."}), 400

        # 파일 저장 경로 설정
        file_path = "./temp_audio.wav"
        file.save(file_path)

        print(f"파일이 {file_path}에 저장되었습니다. Whisper로 변환 시작...")

        # Whisper를 사용해 STT 변환
        result = model.transcribe(file_path, language="ko")
        os.remove(file_path)  # 임시 파일 삭제
        print("STT 변환 완료:", result["text"])

        return jsonify({"text": result["text"]})
    except Exception as e:
        print(f"오류 발생: {str(e)}")
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    port = 5001
    print(f"서버가 실행 중입니다. http://0.0.0.0:{port}")
    app.run(host="0.0.0.0", port=port)
