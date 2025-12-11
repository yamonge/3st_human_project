package com.cucook.moc.gemini;

import com.google.cloud.vertexai.VertexAI;
import com.google.cloud.vertexai.api.Blob;
import com.google.cloud.vertexai.api.Content;
import com.google.cloud.vertexai.api.GenerationConfig;
import com.google.cloud.vertexai.api.GenerateContentResponse;
import com.google.cloud.vertexai.api.Part;
import com.google.cloud.vertexai.generativeai.GenerativeModel;
import com.google.protobuf.ByteString;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class GeminiApiUtils {

    @Value("${vertexai.project-id}")
    private String projectId;

    @Value("${vertexai.location}")
    private String location;

    public GeminiApiUtils(@Value("${gemini.api.key}") String apiKey) {
        // API key는 SDK 내부에서 Application Default Credentials 등으로 처리
    }

    private static final String SYSTEM_INSTRUCTION_GENERAL_CHEF_AI =
            "당신은 세계 최고의 요리 전문가 AI입니다. 사용자의 요청에 정확하게 응답하세요.";

    private static final String SYSTEM_INSTRUCTION_RECEIPT_OCR_AI =
            "당신은 영수증 분석 AI입니다. 이미지에서 재료명만 JSON으로 반환하세요.";

    public String callGeminiApi(String fullPrompt) throws Exception {
        try (VertexAI vertexAI = new VertexAI(projectId, location)) {

            GenerationConfig config = GenerationConfig.newBuilder()
                    .setResponseMimeType("application/json")
                    .build();

            // 모델 인스턴스 생성 시 또는 withGenerationConfig로 설정
            GenerativeModel model = new GenerativeModel("gemini-2.5-flash", vertexAI)
                    .withGenerationConfig(config);

            String promptText = SYSTEM_INSTRUCTION_GENERAL_CHEF_AI + "\n" + fullPrompt;

            Content content = Content.newBuilder()
                    .addParts(Part.newBuilder().setText(promptText).build())
                    .build();

            // ✅ 이제 generateContent는 config가 이미 모델에 붙어 있으므로 content만 전달
            GenerateContentResponse response = model.generateContent(content);

            return response.getCandidates(0).getContent().getParts(0).getText();
        }
    }

    public String callGeminiVisionApiForReceipt(byte[] imageBytes, String mimeType) throws Exception {
        try (VertexAI vertexAI = new VertexAI(projectId, location)) {

            GenerationConfig config = GenerationConfig.newBuilder()
                    .setResponseMimeType("application/json")
                    .build();

            GenerativeModel model = new GenerativeModel("gemini-2.5-flash", vertexAI)
                    .withGenerationConfig(config);

            // InlineData 대신 Blob 사용
            Blob imageBlob = Blob.newBuilder()
                    .setData(ByteString.copyFrom(imageBytes))
                    .setMimeType(mimeType)
                    .build();

            Part imagePart = Part.newBuilder()
                    .setInlineData(imageBlob)   // ← Blob 사용
                    .build();

            String prompt = SYSTEM_INSTRUCTION_RECEIPT_OCR_AI +
                    "\n이 영수증에서 재료명만 콤마로 구분하여 반환해줘. 가격/수량 제외.";

            Content content = Content.newBuilder()
                    .addParts(imagePart)
                    .addParts(Part.newBuilder().setText(prompt).build())
                    .build();

            GenerateContentResponse response = model.generateContent(content);

            return response.getCandidates(0).getContent().getParts(0).getText();
        }
    }

    public Optional<String> generateRecipeImage(String recipeName) {
        return Optional.empty();
    }
}
