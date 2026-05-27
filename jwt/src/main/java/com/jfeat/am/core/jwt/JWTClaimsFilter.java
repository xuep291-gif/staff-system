package com.jfeat.am.core.jwt;

import io.jsonwebtoken.Claims;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

/**
 * Created by jackyhuang on 2017/6/9.
 */
@Component
public class JWTClaimsFilter implements Filter {
    private static transient final Logger log = LoggerFactory.getLogger(JWTClaimsFilter.class);

    /**
     * FilterConfig provided by the Servlet container at start-up.
     */
    protected FilterConfig filterConfig;

    /**
     * Returns the servlet container specified {@code FilterConfig} instance provided at
     * {@link #init(javax.servlet.FilterConfig) startup}.
     *
     * @return the servlet container specified {@code FilterConfig} instance provided at start-up.
     */
    public FilterConfig getFilterConfig() {
        return filterConfig;
    }

    /**
     * Sets the FilterConfig <em>and</em> the {@code ServletContext} as attributes of this class for use by
     * subclasses.  That is:
     * <pre>
     * this.filterConfig = filterConfig;
     * setServletContext(filterConfig.getServletContext());</pre>
     *
     * @param filterConfig the FilterConfig instance provided by the Servlet container at start-up.
     */
    public void setFilterConfig(FilterConfig filterConfig) {
        this.filterConfig = filterConfig;
        //setServletContext(filterConfig.getServletContext());
    }

    /**
     * Returns the value for the named {@code init-param}, or {@code null} if there was no {@code init-param}
     * specified by that name.
     *
     * @param paramName the name of the {@code init-param}
     * @return the value for the named {@code init-param}, or {@code null} if there was no {@code init-param}
     *         specified by that name.
     */
    protected String getInitParam(String paramName) {
        FilterConfig config = getFilterConfig();
        if (config != null) {
            return config.getInitParameter(paramName);
        }
        return null;
    }

    /**
     * Sets the filter's {@link #setFilterConfig filterConfig} and then immediately calls
     * {@link #onFilterConfigSet() onFilterConfigSet()} to trigger any processing a subclass might wish to perform.
     *
     * @param filterConfig the servlet container supplied FilterConfig instance.
     * @throws javax.servlet.ServletException if {@link #onFilterConfigSet() onFilterConfigSet()} throws an Exception.
     */
    public final void init(FilterConfig filterConfig) throws ServletException {
        setFilterConfig(filterConfig);
        try {
            onFilterConfigSet();
        } catch (Exception e) {
            if (e instanceof ServletException) {
                throw (ServletException) e;
            } else {
                if (log.isErrorEnabled()) {
                    log.error("Unable to start Filter: [" + e.getMessage() + "].", e);
                }
                throw new ServletException(e);
            }
        }
    }

    /**
     * Template method to be overridden by subclasses to perform initialization logic at start-up.  The
     * {@code ServletContext} and {@code FilterConfig} will be accessible
     * (and non-{@code null}) at the time this method is invoked via the
     * methods respectively.
     * <p/>
     * {@code init-param} values may be conveniently obtained via the {@link #getInitParam(String)} method.
     *
     * @throws Exception if the subclass has an error upon initialization.
     */
    protected void onFilterConfigSet() throws Exception {
    }

    /**
     * Default no-op implementation that can be overridden by subclasses for custom cleanup behavior.
     */
    public void destroy() {
    }


    @Override
    public void doFilter(ServletRequest servletRequest,
                         ServletResponse servletResponse,
                         FilterChain filterChain)
            throws IOException, ServletException {
        final HttpServletRequest request = (HttpServletRequest) servletRequest;
        final HttpServletResponse response = (HttpServletResponse) servletResponse;
        final String authHeader = request.getHeader("authorization");

        // CR.do not pass CORS by default, for security.
        // solution: comment out
        // when: 2021-03-11
        //response.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE, PUT, HEAD, PATCH");
        //String url = request.getHeader("Origin");
        //response.setHeader("Access-Control-Allow-Origin", url);
        //response.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type,Origin, No-Cache, X-Requested-With, If-Modified-Since, Pragma, Last-Modified, Cache-Control, Expires, Content-Type, X-E4M-With, Accept");

        response.setCharacterEncoding("UTF-8");
        response.setContentType("application/json; charset=utf-8");

        if ("OPTIONS".equals(request.getMethod())) {
            response.setStatus(HttpServletResponse.SC_NO_CONTENT);
            filterChain.doFilter(request, response);
            return;
        }

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        final String token = authHeader.substring("Bearer ".length());
        Claims claims = JWTService.me().parseToken(token);
        if (claims != null) {
            JWTKit.setData(servletRequest, claims);
        }

        filterChain.doFilter(request, response);
    }
}
