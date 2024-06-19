package com.reactnativepractice;

import android.net.Uri;
import android.util.Log;
import android.content.Context;
import android.media.MediaPlayer; // 추가
import android.media.MediaExtractor;
import android.media.MediaFormat;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Arguments;

import com.arthenica.ffmpegkit.FFmpegKit;
import com.arthenica.ffmpegkit.ReturnCode;

import java.io.File;
import java.util.ArrayList;
import java.io.FileInputStream; // 추가
import java.io.FileOutputStream; // 추가

import be.tarsos.dsp.AudioDispatcher;
import be.tarsos.dsp.AudioEvent;
import be.tarsos.dsp.io.UniversalAudioInputStream;
import be.tarsos.dsp.io.TarsosDSPAudioFormat;
import be.tarsos.dsp.io.android.AudioDispatcherFactory;
import be.tarsos.dsp.pitch.PitchDetectionHandler;
import be.tarsos.dsp.pitch.PitchDetectionResult;
import be.tarsos.dsp.pitch.PitchProcessor;

public class PitchModule extends ReactContextBaseJavaModule {

    private final ReactApplicationContext reactContext;
    private static final String TAG = "PitchModule";

    public PitchModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @Override
    public String getName() {
        return "PitchModule";
    }

    @ReactMethod
    public void analyzePitch(String filePath, Promise promise) {
        AudioDispatcher dispatcher = null;
        try {
            // 파일 경로 로그 출력
            Log.d(TAG, "Received file path: " + filePath);

            // 파일 경로를 절대 경로로 변환
            File audioFile = new File(filePath);
            if (!audioFile.exists()) {
                promise.reject("FILE_NOT_FOUND", "File not found or could not be opened.");
                return;
            }

            Log.d(TAG, "Absolute file path: " + audioFile.getAbsolutePath());

            ArrayList<WritableMap> pitchData = new ArrayList<>();

            // AudioDispatcherFactory를 사용하여 AudioDispatcher 생성
            dispatcher = AudioDispatcherFactory.fromPipe(
                    reactContext, // Context
                    Uri.fromFile(audioFile), // Uri
                    0.0, // 처리 시작 시간 (초)
                    30.0, // 처리할 최대 길이 (초)
                    44100, // 샘플 레이트
                    2048, // 버퍼 크기
                    1024 // 버퍼 겹침
            );

            dispatcher.addAudioProcessor(new PitchProcessor(
                    PitchProcessor.PitchEstimationAlgorithm.FFT_YIN,
                    44100,
                    2048,
                    new PitchDetectionHandler() {
                        @Override
                        public void handlePitch(PitchDetectionResult result, AudioEvent event) {
                            final float pitchInHz = result.getPitch();
                            if (pitchInHz != -1) {
                                WritableMap pitchInfo = Arguments.createMap();
                                pitchInfo.putDouble("pitch", pitchInHz);
                                pitchInfo.putDouble("time", event.getTimeStamp()); // 시간을 초 단위로 저장
                                pitchData.add(pitchInfo);
                            }
                        }
                    }));

            Thread audioThread = new Thread(dispatcher, "Audio Dispatcher");
            audioThread.start();
            audioThread.join(); // Wait for the processing to finish

            if (!pitchData.isEmpty()) {
                WritableArray jsPitches = Arguments.createArray();
                for (WritableMap data : pitchData) {
                    jsPitches.pushMap(data);
                }
                promise.resolve(jsPitches);
            } else {
                promise.reject("NO_PITCH_DETECTED", "No pitch detected");
            }
        } catch (Exception e) {
            Log.e(TAG, "Error analyzing pitch", e);
            promise.reject("ERROR", "Failed to analyze pitch: " + e.getMessage());
        } finally {
            if (dispatcher != null) {
                dispatcher.stop();
            }
        }
    }

    @ReactMethod
    public void amplifyAudioVolume(String filePath, double amplification, Promise promise) {
        try {
            String inputPath = Uri.parse(filePath).getPath();
            File inputFile = new File(inputPath);
            File tempFile = new File(inputFile.getParent(), "AmplifiedUserAudio.wav");

            if (!inputFile.exists()) {
                promise.reject("FILE_NOT_FOUND", "Input file does not exist.");
                return;
            }

            // Using FFmpeg to amplify the audio
            String command = String.format("-y -i %s -filter:a volume=%f %s",
                    inputPath, amplification, tempFile.getAbsolutePath());

            FFmpegKit.executeAsync(command, session -> {
                if (ReturnCode.isSuccess(session.getReturnCode())) {
                    // Amplified file이 원본 파일을 덮어쓰도록 설정
                    if (inputFile.delete() && tempFile.renameTo(inputFile)) {
                        promise.resolve(inputFile.getAbsolutePath());
                    } else {
                        promise.reject("FILE_OPERATION_FAILED", "Failed to replace original file with amplified file.");
                    }
                } else {
                    promise.reject("AMPLIFICATION_FAILED",
                            "FFmpeg process failed with return code " + session.getReturnCode());
                }
            });
        } catch (Exception e) {
            Log.e(TAG, "Audio volume amplification failed.", e);
            promise.reject("ERROR", "Audio volume amplification failed.");
        }
    }

}
