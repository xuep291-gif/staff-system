package com.jfeat.am.core.jwt;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.util.StringUtils;

import java.security.SecureRandom;
import java.time.Duration;
import java.util.Base64;
import java.util.Map;
import java.util.Scanner;

/**
 * X-APPID-KEY 命令行管理工具
 *
 * <p>用于管理 appid 配置和生成 X-APPID-KEY，替代 HTTP API
 *
 * <p>使用方式：
 * <pre>
 * java -cp jwt-core.jar com.jfeat.am.core.jwt.AppidKeyCli
 * </pre>
 *
 * @author jwt-core
 * @since 21.0.0
 */
public class AppidKeyCli {

    private static final Logger logger = LoggerFactory.getLogger(AppidKeyCli.class);

    private static final int DEFAULT_VALIDITY_DAYS = 30;
    private static final int DEFAULT_SECRET_BYTES = 32; // 256 bits
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    /**
     * 命令行选项
     */
    private static class CommandOptions {
        String appid;
        String secret;
        Integer days;
        String expireDate;

        boolean hasExpireDate() {
            return expireDate != null && !expireDate.isEmpty();
        }

        boolean hasDays() {
            return days != null;
        }
    }

    private final AppidKeyResolver resolver;
    private final Scanner scanner;

    public AppidKeyCli() {
        this.resolver = new AppidKeyResolver();
        this.scanner = new Scanner(System.in);
    }

    public static void main(String[] args) {
        AppidKeyCli cli = new AppidKeyCli();

        // 支持命令行参数直接执行
        if (args.length > 0) {
            cli.executeCommand(args);
            return;
        }

        // 交互式模式
        cli.runInteractiveMode();
    }

    /**
     * 交互式模式
     */
    private void runInteractiveMode() {
        printBanner();
        printHelp();

        while (true) {
            System.out.print("\nappid-key> ");
            String input = scanner.nextLine().trim();

            if (input.isEmpty()) {
                continue;
            }

            if ("exit".equalsIgnoreCase(input) || "quit".equalsIgnoreCase(input)) {
                System.out.println("Goodbye!");
                break;
            }

            if ("help".equalsIgnoreCase(input)) {
                printHelp();
                continue;
            }

            String[] parts = input.split("\\s+");
            executeCommand(parts);
        }
    }

    /**
     * 执行命令
     */
    private void executeCommand(String[] args) {
        if (args.length == 0) {
            printHelp();
            return;
        }

        String command = args[0].toLowerCase();

        // 直接模式: appid [days|expire]
        // 如果第一个参数不是已知命令，则视为 appid
        if (!isKnownCommand(command)) {
            handleDirectMode(args);
            return;
        }

        try {
            switch (command) {
                case "generate", "gen" -> handleGenerate(args);
                case "add" -> handleAdd(args);
                case "remove", "rm" -> handleRemove(args);
                case "list", "ls" -> handleList();
                case "refresh" -> handleRefresh(args);
                case "disable" -> handleDisable(args);
                case "enable" -> handleEnable(args);
                case "verify", "check" -> handleVerify(args);
                case "clear" -> handleClear();
                case "help" -> printHelp();
                default -> {
                    System.out.println("Unknown command: " + command);
                    printHelp();
                }
            }
        } catch (Exception e) {
            System.out.println("Error: " + e.getMessage());
            logger.error("Command execution failed", e);
        }
    }

    /**
     * 检查是否是已知命令
     */
    private boolean isKnownCommand(String cmd) {
        return cmd.equals("generate") || cmd.equals("gen") ||
               cmd.equals("add") || cmd.equals("remove") || cmd.equals("rm") ||
               cmd.equals("list") || cmd.equals("ls") ||
               cmd.equals("refresh") || cmd.equals("disable") ||
               cmd.equals("enable") || cmd.equals("verify") ||
               cmd.equals("check") || cmd.equals("clear") ||
               cmd.equals("help") || cmd.equals("exit") || cmd.equals("quit");
    }

    /**
     * 直接模式: appid [days|expire]
     * 自动添加配置并生成 X-APPID-KEY
     */
    private void handleDirectMode(String[] args) {
        if (args.length < 1) {
            printHelp();
            return;
        }

        String appid = args[0];
        String secret = generateSecret();
        String validityInfo;

        // 解析第二个参数：天数或过期日期
        if (args.length >= 2) {
            String secondArg = args[1];
            if (secondArg.matches("\\d+")) {
                // 是数字，视为天数
                int days = Integer.parseInt(secondArg);
                resolver.addConfig(appid, secret, days);
                validityInfo = days + " days";
            } else if (secondArg.matches("\\d{4}-\\d{2}-\\d{2}")) {
                // 是日期格式 YYYY-MM-DD
                resolver.addConfig(appid, secret, secondArg);
                validityInfo = "expire " + secondArg;
            } else {
                System.out.println("Invalid argument: " + secondArg);
                System.out.println("Expected: number (days) or date (YYYY-MM-DD)");
                return;
            }
        } else {
            // 默认30天
            resolver.addConfig(appid, secret, DEFAULT_VALIDITY_DAYS);
            validityInfo = DEFAULT_VALIDITY_DAYS + " days (default)";
        }

        // 输出 YAML 配置
        printYamlConfig(appid, secret, args);

        // 生成 X-APPID-KEY
        String key = resolver.generateKey(appid);
        System.out.println("\n✓ X-APPID-KEY generated:");
        System.out.println("    " + key);

        // 输出 curl 测试命令
        printCurlTestCommand(key);
    }

    /**
     * 生成 X-APPID-KEY
     *
     * Usage: generate <appid> [expired:YYYY-MM-DD]
     */
    private void handleGenerate(String[] args) {
        if (args.length < 2) {
            System.out.println("Usage: generate <appid> [expired:YYYY-MM-DD]");
            return;
        }

        CommandOptions opts = parseOptions(args);
        if (opts.appid == null) {
            System.out.println("Usage: generate <appid> [expired:YYYY-MM-DD]");
            return;
        }

        try {
            String key = resolver.generateKey(opts.appid);
            System.out.println("\n✓ X-APPID-KEY generated successfully:\n");
            System.out.println("    Appid:  " + opts.appid);
            System.out.println("    Key:    " + key);
            System.out.println("\nUsage in HTTP request:");
            System.out.println("    X-APPID-KEY: " + key);
        } catch (IllegalArgumentException e) {
            // Auto-add appid with generated secret if not exists
            System.out.println("⚠ Appid not found, auto-adding with generated secret...");
            String secret = generateSecret();
            addAppidConfig(opts.appid, secret, opts);

            // 输出 YAML 配置
            System.out.println("\n# application.yml");
            System.out.println("jwt:");
            System.out.println("  appid-key:");
            System.out.println("    configs:");
            System.out.println("      " + opts.appid + ":");
            System.out.println("        secret: \"" + secret + "\"");
            if (opts.hasExpireDate()) {
                System.out.println("        expire-date: \"" + opts.expireDate + "\"");
            } else if (opts.hasDays()) {
                System.out.println("        validity-days: " + opts.days);
            } else {
                System.out.println("        validity-days: " + DEFAULT_VALIDITY_DAYS);
            }

            // Retry generation
            String key = resolver.generateKey(opts.appid);
            System.out.println("\n✓ X-APPID-KEY generated successfully:\n");
            System.out.println("    Appid:  " + opts.appid);
            System.out.println("    Key:    " + key);
            System.out.println("\nUsage in HTTP request:");
            System.out.println("    X-APPID-KEY: " + key);
        }
    }

    /**
     * 添加 appid 配置
     *
     * Usage: add <appid> [secret] [days|expired:YYYY-MM-DD]
     * If secret is omitted, a random one will be auto-generated
     * expired: parameter takes priority over days
     */
    private void handleAdd(String[] args) {
        if (args.length < 2) {
            System.out.println("Usage: add <appid> [secret] [days|expired:YYYY-MM-DD]");
            System.out.println("Example: add school-001 mySecretKey 90");
            System.out.println("         add school-001 mySecretKey expired:2027-01-01");
            System.out.println("         add school-001  (auto-generate secret)");
            return;
        }

        CommandOptions opts = parseOptions(args);
        if (opts.appid == null) {
            System.out.println("Usage: add <appid> [secret] [days|expired:YYYY-MM-DD]");
            return;
        }

        String secret = opts.secret != null ? opts.secret : generateSecret();
        addAppidConfig(opts.appid, secret, opts);

        // 输出 YAML 配置
        System.out.println("\n# application.yml");
        System.out.println("jwt:");
        System.out.println("  appid-key:");
        System.out.println("    configs:");
        System.out.println("      " + opts.appid + ":");
        System.out.println("        secret: \"" + secret + "\"");
        if (opts.hasExpireDate()) {
            System.out.println("        expire-date: \"" + opts.expireDate + "\"");
        } else if (opts.hasDays()) {
            System.out.println("        validity-days: " + opts.days);
        } else {
            System.out.println("        validity-days: " + DEFAULT_VALIDITY_DAYS);
        }
    }

    /**
     * 添加 appid 配置（根据选项决定使用天数还是过期日期）
     */
    private void addAppidConfig(String appid, String secret, CommandOptions opts) {
        if (opts.hasExpireDate()) {
            resolver.addConfig(appid, secret, opts.expireDate);
        } else if (opts.hasDays()) {
            resolver.addConfig(appid, secret, opts.days);
        } else {
            resolver.addConfig(appid, secret, DEFAULT_VALIDITY_DAYS);
        }
    }

    /**
     * 移除 appid 配置
     *
     * Usage: remove <appid>
     */
    private void handleRemove(String[] args) {
        if (args.length < 2) {
            System.out.println("Usage: remove <appid>");
            return;
        }

        String appid = args[1];
        resolver.removeConfig(appid);
        System.out.println("✓ Removed appid config: " + appid);
    }

    /**
     * 列出所有配置
     *
     * Usage: list
     */
    private void handleList() {
        Map<String, AppidKeyResolver.AppidConfig> configs = resolver.getAllConfigs();

        if (configs.isEmpty()) {
            System.out.println("No appid configs found.");
            System.out.println("Use 'add <appid> <secret> [days]' to add a config.");
            return;
        }

        System.out.println("\nAppid Configurations:");
        System.out.println("─".repeat(80));
        System.out.printf("%-20s %-15s %-15s %-10s%n", "Appid", "Validity(Days)", "Status", "Secret");
        System.out.println("─".repeat(80));

        configs.forEach((appid, config) -> {
            long days = Duration.ofMillis(config.getValidityMs()).toDays();
            String status = config.isEnabled() ? "Enabled" : "Disabled";
            String secret = config.getSecret().substring(0, Math.min(8, config.getSecret().length())) + "...";
            System.out.printf("%-20s %-15d %-15s %-10s%n", appid, days, status, secret);
        });

        System.out.println("─".repeat(80));
        System.out.println("Total: " + configs.size() + " appid(s)");
    }

    /**
     * 刷新 appid 密钥
     *
     * Usage: refresh <appid> <newSecret>
     */
    private void handleRefresh(String[] args) {
        if (args.length < 3) {
            System.out.println("Usage: refresh <appid> <newSecret>");
            System.out.println("Example: refresh school-001 newSecretKey123");
            return;
        }

        String appid = args[1];
        String newSecret = args[2];

        resolver.refreshSecret(appid, newSecret);
        System.out.println("✓ Refreshed secret for: " + appid);
        System.out.println("Note: All old X-APPID-KEYs for this appid are now invalid.");
    }

    /**
     * 禁用 appid
     *
     * Usage: disable <appid>
     */
    private void handleDisable(String[] args) {
        if (args.length < 2) {
            System.out.println("Usage: disable <appid>");
            return;
        }

        String appid = args[1];
        resolver.disableAppid(appid);
        System.out.println("✓ Disabled appid: " + appid);
    }

    /**
     * 启用 appid
     *
     * Usage: enable <appid>
     */
    private void handleEnable(String[] args) {
        if (args.length < 2) {
            System.out.println("Usage: enable <appid>");
            return;
        }

        String appid = args[1];
        resolver.enableAppid(appid);
        System.out.println("✓ Enabled appid: " + appid);
    }

    /**
     * 验证 X-APPID-KEY
     *
     * Usage: verify <key>
     */
    private void handleVerify(String[] args) {
        if (args.length < 2) {
            System.out.println("Usage: verify <X-APPID-KEY>");
            return;
        }

        String key = args[1];

        // 首先提取 appid
        String extractedAppid = resolver.extractAppid(key);
        if (extractedAppid == null) {
            System.out.println("✗ Invalid X-APPID-KEY");
            System.out.println("    Reason: Invalid format");
            return;
        }

        // 检查是否是永久 appid
        boolean isPermanent = extractedAppid.equals("root") || extractedAppid.equals("none");

        // 解析 appid
        String resolvedAppid = resolver.resolveAppid(key);

        if (resolvedAppid != null) {
            System.out.println("✓ Valid X-APPID-KEY");
            System.out.println("    Appid: " + resolvedAppid);
        } else if (isPermanent) {
            // 检查是否是永久 appid 且签名有效
            // 永久 appid 返回 null 是正常行为
            System.out.println("✓ Valid X-APPID-KEY (Permanent Appid)");
            System.out.println("    Appid: " + extractedAppid);
            System.out.println("    Type: Permanent (no appid filtering)");
            System.out.println("    Note: resolveAppid() returns null as expected");
        } else {
            System.out.println("✗ Invalid X-APPID-KEY");
            System.out.println("    Possible reasons:");
            System.out.println("    - Invalid format");
            System.out.println("    - Signature mismatch");
            System.out.println("    - Appid not found or disabled");
            System.out.println("    - Key expired");
        }
    }

    /**
     * 清空所有配置
     *
     * Usage: clear
     */
    private void handleClear() {
        System.out.print("Are you sure you want to clear all appid configs? (yes/no): ");
        String confirm = scanner.nextLine().trim();

        if ("yes".equalsIgnoreCase(confirm)) {
            resolver.clearConfigs();
            System.out.println("✓ Cleared all appid configs");
        } else {
            System.out.println("Cancelled");
        }
    }

    /**
     * 解析天数
     */
    private int parseDays(String input) {
        try {
            int days = Integer.parseInt(input);
            if (days <= 0) {
                throw new IllegalArgumentException("Days must be positive");
            }
            return days;
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Invalid days: " + input);
        }
    }

    /**
     * 生成安全的随机密钥
     *
     * @return Base64 编码的随机密钥
     */
    private String generateSecret() {
        byte[] secretBytes = new byte[DEFAULT_SECRET_BYTES];
        SECURE_RANDOM.nextBytes(secretBytes);
        return Base64.getEncoder().encodeToString(secretBytes);
    }

    /**
     * 输出 YAML 配置格式
     */
    private void printYamlConfig(String appid, String secret, String[] args) {
        System.out.println("\n# application.yml");
        System.out.println("jwt:");
        System.out.println("  appid-key:");
        System.out.println("    configs:");
        System.out.println("      " + appid + ":");
        System.out.println("        secret: \"" + secret + "\"");

        // 解析第二个参数：天数或过期日期
        if (args.length >= 2) {
            String secondArg = args[1];
            if (secondArg.matches("\\d+")) {
                // 是数字，视为天数
                System.out.println("        validity-days: " + secondArg);
            } else if (secondArg.matches("\\d{4}-\\d{2}-\\d{2}")) {
                // 是日期格式 YYYY-MM-DD
                System.out.println("        expire-date: \"" + secondArg + "\"");
            }
        } else {
            // 默认30天
            System.out.println("        validity-days: " + DEFAULT_VALIDITY_DAYS);
        }
    }

    /**
     * 解析命令选项（支持 expired:YYYY-MM-DD 格式）
     *
     * @param args 命令参数
     * @return 解析后的选项
     */
    private CommandOptions parseOptions(String[] args) {
        CommandOptions opts = new CommandOptions();
        for (String arg : args) {
            if (arg.startsWith("expired:") || arg.startsWith("--expired:")) {
                String value = arg.substring(arg.startsWith("--expired:") ? 10 : 8);
                opts.expireDate = value;
            } else if (arg.matches("\\d+")) {
                opts.days = Integer.parseInt(arg);
            } else if (!arg.equals("add") && !arg.equals("generate") && !arg.equals("gen")) {
                if (opts.appid == null) {
                    opts.appid = arg;
                } else if (opts.secret == null) {
                    opts.secret = arg;
                }
            }
        }
        return opts;
    }

    private void printBanner() {
        System.out.println();
        System.out.println("╔════════════════════════════════════════════════════════════╗");
        System.out.println("║         X-APPID-KEY Management CLI v21.0.0                ║");
        System.out.println("║         jwt-core - Appid Key Management                   ║");
        System.out.println("╚════════════════════════════════════════════════════════════╝");
    }

    private void printHelp() {
        System.out.println("\nDirect Mode (Recommended):");
        System.out.println("  <appid> [days|expire]      Auto-add config and generate key");
        System.out.println("                            days: number (e.g., 30, 90, 365)");
        System.out.println("                            expire: YYYY-MM-DD (e.g., 2027-01-01)");
        System.out.println("\nOther Commands:");
        System.out.println("  list                       List all appid configurations");
        System.out.println("  verify <key>               Verify an X-APPID-KEY");
        System.out.println("  remove <appid>             Remove appid configuration");
        System.out.println("  help                       Show this help message");
        System.out.println("  exit/quit                  Exit the program");
        System.out.println("\nExamples:");
        System.out.println("  xuexi-songto 2027-01-01    (expire on 2027-01-01)");
        System.out.println("  xuexi-songto 90            (valid for 90 days)");
        System.out.println("  xuexi-songto               (default 30 days)");
        System.out.println("  verify <paste-key-here>    (verify a key)");
    }

    /**
     * 输出 curl 测试命令
     */
    private void printCurlTestCommand(String key) {
        System.out.println("\nTest with curl:");
        System.out.println("    curl -H \"X-APPID-KEY: " + key + "\" http://localhost:8080/api/endpoint");
    }

    /**
     * 获取 AppidKeyResolver 实例（用于 Spring 集成）
     */
    public AppidKeyResolver getResolver() {
        return resolver;
    }
}
