package com.cucook.moc.common;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.io.FileInputStream;
import java.io.InputStream;
import java.util.List;

@Service
public class FirebaseService {

    @PostConstruct
    public void initialize() {
        try {
            System.out.println("🔥 Firebase 초기화 시작...");

            String firebaseConfigPath = System.getenv("FIREBASE_CONFIG_PATH");

            FirebaseOptions options;

            if (firebaseConfigPath != null && !firebaseConfigPath.isEmpty()) {
                try (FileInputStream serviceAccount = new FileInputStream(firebaseConfigPath)) {
                    options = FirebaseOptions.builder()
                            .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                            .build();
                }
            } else {
                // ✅ resources에서 classpath로 로드 (권장)
                try (InputStream serviceAccount =
                             getClass().getClassLoader().getResourceAsStream("firebase-service-account.json")) {

                    if (serviceAccount == null) {
                        System.err.println("❌ firebase-service-account.json not found in resources/firebase/");
                        return;
                    }

                    options = FirebaseOptions.builder()
                            .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                            .build();
                }
            }

            if (FirebaseApp.getApps().isEmpty()) {
                FirebaseApp.initializeApp(options);
                System.out.println("✅ Firebase 초기화 성공!");
            }
        } catch (Exception e) {
            System.err.println("❌ Firebase 초기화 실패: " + e.getMessage());
        }
    }

    public void sendPushNotification(String fcmToken, String title, String body) {
        try {
            Message message = Message.builder()
                    .setToken(fcmToken)
                    .setNotification(Notification.builder()
                            .setTitle(title)
                            .setBody(body)
                            .build())
                    .build();

            String response = FirebaseMessaging.getInstance().send(message);
            System.out.println("✅ 푸시 알림 전송 성공: " + response);
        } catch (Exception e) {
            System.err.println("❌ 푸시 알림 전송 실패: " + e.getMessage());
        }
    }

    public void sendPushNotificationMulti(List<String> fcmTokens, String title, String body) {
        for (String token : fcmTokens) {
            if (token != null && !token.isEmpty()) {
                sendPushNotification(token, title, body);
            }
        }
    }
}
