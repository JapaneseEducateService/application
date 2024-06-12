package com.reactnativepractice;

import android.net.Uri;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Arguments;

import java.util.ArrayList;

import be.tarsos.dsp.AudioDispatcher;
import be.tarsos.dsp.AudioEvent;
import be.tarsos.dsp.io.android.AudioDispatcherFactory;
import be.tarsos.dsp.pitch.PitchDetectionHandler;
import be.tarsos.dsp.pitch.PitchDetectionResult;
import be.tarsos.dsp.pitch.PitchProcessor;
import android.util.Log;

public class PitchModule extends ReactContextBaseJavaModule {

    private final ReactApplicationContext reactContext;

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
        try {
            Uri fileUri = Uri.parse(filePath);
            ArrayList<WritableMap> pitchData = new ArrayList<>();

            AudioDispatcher dispatcher = AudioDispatcherFactory.fromPipe(
                    reactContext, // Context
                    fileUri, // Uri
                    0.0, // double, 처리 시작 시간 (초)
                    30, // double, 처리할 최대 길이 (초)
                    44100, // int, 샘플 레이트
                    2048, // int, 버퍼 크기
                    1024 // int, 버퍼 겹침
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
            promise.reject("ERROR", "Failed to analyze pitch: " + e.getMessage());
        }
    }
}
