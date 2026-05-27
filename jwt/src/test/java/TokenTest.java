import com.jfeat.AmApplication;
import com.jfeat.am.core.jwt.JWTService;
import com.jfeat.am.core.jwt.UserJwtService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

import jakarta.annotation.Resource;

/**
 * @description: TODO
 * @project: jwt-core
 * @date: 2024/8/14 11:55
 * @author: hhhhhtao
 */
@SpringBootTest(classes = AmApplication.class, webEnvironment = SpringBootTest.WebEnvironment.MOCK)
public class TokenTest {

    @Resource
    private JWTService jwtService;
    @Resource
    private UserJwtService userJwtService;

    // @Test
    public void tokenParseTest() {
        String token = "eyJ0eXBlIjoiSldUIiwiYWxnIjoiSFM1MTIifQ.eyJvcmdJZCI6MSwidXNlcklkIjoyOTI1LCJhY2NvdW50IjoiODJmNzgxMjEyYjE0NDM5NTkzM2NhMzUzMmUzOTk4MGIiLCJkb21haW5Vc2VySWQiOiIiLCJ0eXBlIjoyNjIxNDQsImFwcGlkIjoiIiwibmFtZSI6IuWChea2myIsIm9yZ2FuaXphdGlvblVzZXIiOjAsImlhdCI6MTcyODU1MTE5OSwianRpIjoiMjkyNSIsInN1YiI6IjgyZjc4MTIxMmIxNDQzOTU5MzNjYTM1MzJlMzk5ODBiIiwiZXhwIjoxNzI4ODEwMzk5fQ.Dk5MQZDuYyL3YN80j-eNIEFhYZod4Fixa1w0bm63sHUarDB68iUzSkmqLt-RX_90GDPKFwXW1OwxNDqLo0dqYQ";

        Claims claims =  Jwts.parser()
                .verifyWith(Keys.hmacShaKeyFor(java.util.Base64.getDecoder().decode("bm9ybWFsLWVuY29kZWQta2V5")))
                .build()
                .parseSignedClaims(token).getPayload();
        System.out.printf(claims.toString());
    }

    // @Test
    public void userTokenBuildTest() {
        // 假设参数
        Long orgId = 1L;
        Long userId = 2753L;
        String account = "034e07cae9324b1188b5923f2daf5f4b";
        Integer userType = 16;

        // 执行方法
         // String token = userJwtService.createToken(orgId, userId, account, userType);
        String token = "eyJ0eXBlIjoiSldUIiwiYWxnIjoiSFM1MTIifQ.eyJvcmdJZCI6MSwidXNlcklkIjozMzEyLCJhY2NvdW50IjoidWlhZHJwY3c3d2ciLCJkb21haW5Vc2VySWQiOiIiLCJ0eXBlIjoyNjIxNDQsImFwcGlkIjoiIiwibmFtZSI6IuacsemfrCIsIm9yZ2FuaXphdGlvblVzZXIiOjAsInBhcnR5TWVtYmVySWQiOiIiLCJwYXJ0eU9yZ2FuaXphdGlvbklkIjoiIiwiaWF0IjoxNzM1ODc5OTc4LCJqdGkiOiIzMzEyIiwic3ViIjoidWlhZHJwY3c3d2ciLCJleHAiOjE3MzYxMzkxNzh9.H6-1zsPWT-JWoknc4P-Z1xsrTYxUCZ6U2F9kEhqjIIREcn4MHCJRGVO5r36q55Bx9ZTAzRdAtcTNYp2i0HcJeg";

        // 验证
        Claims claims =  Jwts.parser()
                .verifyWith(Keys.hmacShaKeyFor(java.util.Base64.getDecoder().decode("bm9ybWFsLWVuY29kZWQta2V5")))
                .build()
                .parseSignedClaims(token).getPayload();
        System.out.println("token: " + token);
        // Claims claims = userJwtService.parseToken(token);
        System.out.printf(claims.toString());
    }

    @Test
    public void adminTokenBuildTest() {
        // 假设
        Long orgId = 1L;
        Long userId = 1L;
        String account = "admin";
        Integer userType = 100;
        Long tenantOrgId = 1L;
        Integer devUserType = 0;
        String bUserType = "SYSTEM";
        String appId = "";

        // 创建token
        String token = jwtService.createToken(orgId, userId, account, userType, tenantOrgId, devUserType, appId);

        System.out.println("token: " + token);
        Claims claims = jwtService.parseToken(token);
        System.out.println("解析结果：" + claims.toString());
    }
}
