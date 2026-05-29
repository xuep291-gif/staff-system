package com.jfeat.processTask.utils;

import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

/**
 * 文件存储静态工具类
 * 支持本地存储和OSS存储（需配置）
 */
public final class FileStorageUtils {

    // 禁止实例化
    private FileStorageUtils() {}

    // 本地存储根路径（从配置读取）
    private static String LOCAL_STORAGE_PATH = "/data/uploads/";

    // OSS配置开关（从配置读取）
    private static boolean OSS_ENABLED = false;

    public static String getLocalStoragePath() {
        return LOCAL_STORAGE_PATH;
    }

    public static void setLocalStoragePath(String localStoragePath) {
        LOCAL_STORAGE_PATH = localStoragePath;
    }

    public static boolean isOssEnabled() {
        return OSS_ENABLED;
    }

    public static void setOssEnabled(boolean ossEnabled) {
        OSS_ENABLED = ossEnabled;
    }

    /**
     * 静态初始化（实际项目应从配置读取）
     */
    static {
        // 这里可以改为从配置中心读取
        // LOCAL_STORAGE_PATH = config.getFileStoragePath();
        // OSS_ENABLED = config.isOssEnabled();
    }

    /**
     * 上传文件（自动选择存储方式）
     * @return 文件访问URL
     */
    public static String upload(MultipartFile file) throws IOException {
        if (OSS_ENABLED) {
            return uploadToOss(file);
        } else {
            return uploadToLocal(file);
        }
    }

    /**
     * 本地存储实现
     */
    private static String uploadToLocal(MultipartFile file) throws IOException {
        // 确保目录存在
        Path storagePath = Paths.get(LOCAL_STORAGE_PATH);
        if (!Files.exists(storagePath)) {
            Files.createDirectories(storagePath);
        }

        // 生成唯一文件名
        String originalFilename = file.getOriginalFilename();
        String fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
        String newFilename = UUID.randomUUID() + fileExtension;

        // 存储文件
        Path targetPath = storagePath.resolve(newFilename);
        Files.copy(file.getInputStream(), targetPath);

        // 返回相对路径（实际项目可能返回完整URL）
        return "/uploads/" + newFilename;
    }

    /**
     * OSS存储实现（需实现OSS客户端）
     */
    private static String uploadToOss(MultipartFile file) {
        // 实际实现需要OSS客户端
        // String endpoint = "https://oss-cn-hangzhou.aliyuncs.com";
        // OSS ossClient = new OSSClientBuilder().build(endpoint, accessKeyId, accessKeySecret);

        try {
            String objectName = "files/" + UUID.randomUUID() +
                    file.getOriginalFilename().substring(
                            file.getOriginalFilename().lastIndexOf("."));

            // 模拟上传
            // ossClient.putObject(bucketName, objectName, file.getInputStream());

            return "https://oss.example.com/" + objectName;
        } catch (Exception e) {
            throw new RuntimeException("OSS文件上传失败", e);
        } finally {
            // ossClient.shutdown();
        }
    }

    /**
     * 删除文件
     */
    public static void delete(String fileUrl) {
        if (fileUrl == null) return;

        if (fileUrl.startsWith("/uploads/")) {
            deleteLocal(fileUrl);
        } else if (fileUrl.contains("oss.example.com")) {
            deleteFromOss(fileUrl);
        }
    }

    private static void deleteLocal(String fileUrl) {
        try {
            Path path = Paths.get(LOCAL_STORAGE_PATH, fileUrl.replace("/uploads/", ""));
            Files.deleteIfExists(path);
        } catch (IOException e) {
            throw new RuntimeException("本地文件删除失败: " + fileUrl, e);
        }
    }

    private static void deleteFromOss(String fileUrl) {
        // 实现OSS删除逻辑
        // String objectName = fileUrl.replace("https://oss.example.com/", "");
        // ossClient.deleteObject(bucketName, objectName);
    }
}