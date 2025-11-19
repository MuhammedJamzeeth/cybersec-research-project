"""
Request Logger Middleware - Morgan-style logging for FastAPI
Automatically inspects and logs all API requests and responses
"""
import time
import json
from datetime import datetime
from typing import Callable
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import Message
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(message)s'
)
logger = logging.getLogger("api_logger")


class RequestLoggerMiddleware(BaseHTTPMiddleware):
    """
    Morgan-style middleware for FastAPI that automatically logs all API requests.
    Logs: method, URL, status code, response time, IP address, and user agent.
    """
    
    def __init__(self, app, format: str = "combined"):
        super().__init__(app)
        self.format = format
        
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Start timer
        start_time = time.time()
        
        # Capture request details
        client_ip = request.client.host if request.client else "unknown"
        method = request.method
        url = str(request.url)
        user_agent = request.headers.get("user-agent", "-")
        
        # Store request body for logging (if applicable)
        request_body = None
        if method in ["POST", "PUT", "PATCH"]:
            try:
                body = await request.body()
                if body:
                    request_body = body.decode('utf-8')
                    # Store it back for the actual route handler
                    async def receive() -> Message:
                        return {"type": "http.request", "body": body}
                    request._receive = receive
            except Exception:
                pass
        
        # Process the request
        try:
            response = await call_next(request)
            status_code = response.status_code
        except Exception as e:
            status_code = 500
            logger.error(f"❌ Request failed: {method} {url} - Error: {str(e)}")
            raise
        
        # Calculate response time
        process_time = time.time() - start_time
        response_time_ms = round(process_time * 1000, 2)
        
        # Log based on format
        if self.format == "combined":
            self._log_combined(client_ip, method, url, status_code, response_time_ms, user_agent)
        elif self.format == "dev":
            self._log_dev(method, url, status_code, response_time_ms)
        elif self.format == "detailed":
            self._log_detailed(client_ip, method, url, status_code, response_time_ms, user_agent, request_body)
        else:
            self._log_short(method, url, status_code, response_time_ms)
        
        # Add response time header
        response.headers["X-Response-Time"] = f"{response_time_ms}ms"
        
        return response
    
    def _log_combined(self, ip: str, method: str, url: str, status: int, time_ms: float, user_agent: str):
        """Apache combined log format"""
        timestamp = datetime.now().strftime("%d/%b/%Y:%H:%M:%S %z")
        color = self._get_status_color(status)
        logger.info(f'{ip} - [{timestamp}] "{method} {url}" {color}{status}\033[0m {time_ms}ms "{user_agent}"')
    
    def _log_dev(self, method: str, url: str, status: int, time_ms: float):
        """Development format with color coding"""
        color = self._get_status_color(status)
        method_color = self._get_method_color(method)
        logger.info(f"{method_color}{method}\033[0m {url} {color}{status}\033[0m {time_ms}ms")
    
    def _log_detailed(self, ip: str, method: str, url: str, status: int, time_ms: float, user_agent: str, body: str = None):
        """Detailed format with request body"""
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        color = self._get_status_color(status)
        
        log_msg = f"""
{'='*80}
[{timestamp}] {method} {url}
IP: {ip}
Status: {color}{status}\033[0m
Response Time: {time_ms}ms
User-Agent: {user_agent}"""
        
        if body:
            try:
                # Try to pretty print JSON
                body_json = json.loads(body)
                body_str = json.dumps(body_json, indent=2)
                log_msg += f"\nRequest Body:\n{body_str}"
            except:
                # If not JSON, just add as string
                if len(body) > 500:
                    log_msg += f"\nRequest Body: {body[:500]}... (truncated)"
                else:
                    log_msg += f"\nRequest Body: {body}"
        
        log_msg += f"\n{'='*80}"
        logger.info(log_msg)
    
    def _log_short(self, method: str, url: str, status: int, time_ms: float):
        """Short format"""
        color = self._get_status_color(status)
        logger.info(f"{method} {url} {color}{status}\033[0m {time_ms}ms")
    
    def _get_status_color(self, status: int) -> str:
        """Get ANSI color code based on status"""
        if status >= 500:
            return "\033[91m"  # Red
        elif status >= 400:
            return "\033[93m"  # Yellow
        elif status >= 300:
            return "\033[96m"  # Cyan
        elif status >= 200:
            return "\033[92m"  # Green
        else:
            return "\033[0m"   # Reset
    
    def _get_method_color(self, method: str) -> str:
        """Get ANSI color code based on HTTP method"""
        colors = {
            "GET": "\033[92m",    # Green
            "POST": "\033[96m",   # Cyan
            "PUT": "\033[93m",    # Yellow
            "DELETE": "\033[91m", # Red
            "PATCH": "\033[95m",  # Magenta
        }
        return colors.get(method, "\033[0m")


def setup_request_logger(app, format: str = "dev"):
    """
    Add request logging middleware to FastAPI app
    
    Args:
        app: FastAPI application instance
        format: Log format - 'dev', 'combined', 'short', or 'detailed'
    """
    app.add_middleware(RequestLoggerMiddleware, format=format)
    logger.info(f"✅ Request logger initialized (format: {format})")


# Alternative: Decorator-based logging for specific routes
def log_request(func):
    """Decorator to log individual route requests"""
    async def wrapper(*args, **kwargs):
        request = kwargs.get('request') or (args[0] if args else None)
        if isinstance(request, Request):
            start_time = time.time()
            logger.info(f"➡️  {request.method} {request.url.path}")
            
            try:
                result = await func(*args, **kwargs)
                process_time = (time.time() - start_time) * 1000
                logger.info(f"✅ {request.method} {request.url.path} completed in {process_time:.2f}ms")
                return result
            except Exception as e:
                process_time = (time.time() - start_time) * 1000
                logger.error(f"❌ {request.method} {request.url.path} failed after {process_time:.2f}ms: {str(e)}")
                raise
        else:
            return await func(*args, **kwargs)
    
    return wrapper
