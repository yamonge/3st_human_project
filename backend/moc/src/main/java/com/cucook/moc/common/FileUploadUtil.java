package com.cucook.moc.common;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

/**
 * 파일 업로드 유틸리티
 * 프로필 이미지 등 파일을 로컬 파일 시스템에 저장하고 URL을 반환합니다.
 */
@Component
public class FileUploadUtil {

    private final String serverBaseUrl;

    public FileUploadUtil(@Value("${server.base-url:http://localhost:8090}") String serverBaseUrl) {
        this.serverBaseUrl = serverBaseUrl;
    }

    // 업로드 기본 경로 (프로젝트 루트 기준)
    private static final String UPLOAD_BASE_DIR = "src/main/resources/static/uploads/";
    
    // 프로필 이미지 저장 경로
    private static final String PROFILE_DIR = "profile/";
    
    // 공지사항 이미지 저장 경로
    private static final String NOTICE_DIR = "notice/";

    /**
     * 프로필 이미지 저장
     * @param file 업로드된 파일
     * @return 저장된 파일의 상대 경로 (예: /uploads/profile/uuid_filename.jpg)
     * @throws IOException 파일 저장 실패 시
     */
    public String saveProfileImage(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            return null;
        }

        // 파일명 생성 (UUID + 원본 파일명)
        String originalFilename = file.getOriginalFilename();
        String extension = getFileExtension(originalFilename);
        String fileName = UUID.randomUUID().toString() + extension;

        // 저장 경로 생성
        Path uploadPath = Paths.get(UPLOAD_BASE_DIR + PROFILE_DIR);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // 파일 저장
        Path filePath = uploadPath.resolve(fileName);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        // 상대 경로 반환 (조회 시 서비스 레이어에서 절대 URL로 변환)
        return "/uploads/" + PROFILE_DIR + fileName;
    }

    /**
     * 공지사항 이미지 저장
     * @param file 업로드된 파일
     * @return 저장된 파일의 상대 경로 (예: /uploads/notice/uuid_filename.jpg)
     * @throws IOException 파일 저장 실패 시
     */
    public String saveNoticeImage(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            return null;
        }

        // 파일명 생성 (UUID + 원본 파일명)
        String originalFilename = file.getOriginalFilename();
        String extension = getFileExtension(originalFilename);
        String fileName = UUID.randomUUID().toString() + extension;

        // 저장 경로 생성
        Path uploadPath = Paths.get(UPLOAD_BASE_DIR + NOTICE_DIR);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // 파일 저장
        Path filePath = uploadPath.resolve(fileName);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        // 상대 경로 반환 (조회 시 서비스 레이어에서 절대 URL로 변환)
        return "/uploads/" + NOTICE_DIR + fileName;
    }

    /**
     * 파일 삭제
     * @param fileUrl 삭제할 파일의 URL (예: /uploads/profile/uuid_filename.jpg)
     * @return 삭제 성공 여부
     */
    public static boolean deleteFile(String fileUrl) {
        if (fileUrl == null || fileUrl.isEmpty()) {
            return false;
        }

        try {
            // URL에서 실제 파일 경로 추출
            String filePath = fileUrl.replace("/uploads/", UPLOAD_BASE_DIR);
            Path path = Paths.get(filePath);
            
            if (Files.exists(path)) {
                Files.delete(path);
                return true;
            }
        } catch (IOException e) {
            // 로그만 남기고 예외는 무시 (파일이 이미 없을 수도 있음)
            System.err.println("파일 삭제 실패: " + fileUrl + " - " + e.getMessage());
        }
        return false;
    }

    /**
     * 파일 확장자 추출
     * @param filename 파일명
     * @return 확장자 (점 포함, 예: .jpg)
     */
    private static String getFileExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return ".jpg"; // 기본값
        }
        return filename.substring(filename.lastIndexOf("."));
    }

    /**
     * 파일 크기 검증 (10MB 제한)
     * @param file 검증할 파일
     * @return 유효 여부
     */
    public static boolean isValidFileSize(MultipartFile file) {
        if (file == null) {
            return true;
        }
        // 10MB = 10 * 1024 * 1024 bytes
        long maxSize = 10 * 1024 * 1024;
        return file.getSize() <= maxSize;
    }

    /**
     * 이미지 파일 형식 검증
     * @param file 검증할 파일
     * @return 유효 여부
     */
    public static boolean isValidImageFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return false;
        }

        String contentType = file.getContentType();
        if (contentType == null) {
            return false;
        }

        // 허용된 이미지 타입: jpg, jpeg, png, gif, heic
        return contentType.equals("image/jpeg") ||
               contentType.equals("image/png") ||
               contentType.equals("image/gif") ||
               contentType.equals("image/heic") ||
               contentType.equals("image/jpg");
    }
}
